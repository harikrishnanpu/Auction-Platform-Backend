"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceBidUseCase = void 0;
const auction_policy_1 = require("@domain/entities/auction/auction.policy");
const result_1 = require("@result/result");
const redis_service_1 = require("@infrastructure/services/redis/redis.service");
class PlaceBidUseCase {
    constructor(auctionRepository, bidRepository, participantRepository, activityRepository, transactionManager) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.participantRepository = participantRepository;
        this.activityRepository = activityRepository;
        this.transactionManager = transactionManager;
    }
    async execute(auctionId, userId, amount) {
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redis_service_1.redisService.acquireLock(lockKey, 5000);
        if (!lockAcquired) {
            return result_1.Result.fail("Another bid is being processed. Please try again in a moment.");
        }
        try {
            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (!participant) {
                return result_1.Result.fail("User not entered in auction");
            }
            if (participant.revokedAt) {
                return result_1.Result.fail("User revoked from auction");
            }
            const result = await this.transactionManager.runInTransaction(async (tx) => {
                const auction = await this.auctionRepository.findByIdForUpdate(auctionId, tx);
                if (!auction) {
                    return result_1.Result.fail("Auction not found");
                }
                const secondsRemaining = await redis_service_1.redisService.getSecondsUntilCanBid(auctionId, userId, auction.bidCooldownSeconds);
                if (secondsRemaining > 0) {
                    return result_1.Result.fail(`Please wait ${secondsRemaining} seconds before placing another bid`);
                }
                try {
                    (0, auction_policy_1.ensureAuctionActive)(auction);
                    (0, auction_policy_1.ensureAuctionWindow)(auction, new Date());
                }
                catch (e) {
                    return result_1.Result.fail(e.message);
                }
                if (auction.sellerId === userId) {
                    return result_1.Result.fail("Seller cannot bid");
                }
                try {
                    (0, auction_policy_1.ensureBidAmount)(auction, amount);
                }
                catch (e) {
                    return result_1.Result.fail(e.message);
                }
                // Create bid
                const bid = await this.bidRepository.createBid(auctionId, userId, amount, tx);
                await this.auctionRepository.updateCurrentPrice(auctionId, amount, tx);
                // Check for anti-sniping extension
                const now = new Date();
                const endTime = new Date(auction.endAt);
                const secondsToEnd = Math.floor((endTime.getTime() - now.getTime()) / 1000);
                let extended = false;
                let newEndTime = endTime;
                if (secondsToEnd > 0 &&
                    secondsToEnd <= auction.antiSnipeThresholdSeconds &&
                    auction.extensionCount < auction.maxExtensions) {
                    newEndTime = new Date(endTime.getTime() + (auction.antiSnipeExtensionSeconds * 1000));
                    const newExtensionCount = auction.extensionCount + 1;
                    await this.auctionRepository.extendAuction(auctionId, newEndTime, newExtensionCount, tx);
                    extended = true;
                    // Log extension activity (non-blocking)
                    this.activityRepository.logActivity(auctionId, "AUCTION_EXTENDED", `Auction extended by ${auction.antiSnipeExtensionSeconds}s due to late bid (${newExtensionCount}/${auction.maxExtensions})`, userId, {
                        extensionNumber: newExtensionCount,
                        maxExtensions: auction.maxExtensions,
                        newEndTime: newEndTime.toISOString(),
                        triggerBidId: bid.id
                    }).catch(err => console.error('Failed to log extension activity:', err));
                }
                // Log bid activity (non-blocking)
                this.activityRepository.logActivity(auctionId, "BID_PLACED", `New bid placed: ₹${amount.toLocaleString()}`, userId, { bidId: bid.id, amount, extended }).catch(err => console.error('Failed to log bid activity:', err));
                // Record bid timestamp for rate limiting
                await redis_service_1.redisService.recordBid(auctionId, userId, auction.bidCooldownSeconds);
                return {
                    bid,
                    extended,
                    newEndTime: extended ? newEndTime : endTime,
                    extensionCount: extended ? auction.extensionCount + 1 : auction.extensionCount
                };
            });
            return result_1.Result.ok(result);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
        finally {
            await redis_service_1.redisService.releaseLock(lockKey);
        }
    }
}
exports.PlaceBidUseCase = PlaceBidUseCase;
