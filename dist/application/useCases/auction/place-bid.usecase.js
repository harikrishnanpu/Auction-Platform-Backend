"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceBidUseCase = void 0;
const auction_policy_1 = require("../../../domain/auction/auction.policy");
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const redis_service_1 = require("../../../infrastructure/services/redis/redis.service");
class PlaceBidUseCase {
    constructor(auctionRepository, bidRepository, participantRepository, activityRepository, transactionManager) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.participantRepository = participantRepository;
        this.activityRepository = activityRepository;
        this.transactionManager = transactionManager;
    }
    async execute(auctionId, userId, amount) {
        // Acquire distributed lock for this auction
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redis_service_1.redisService.acquireLock(lockKey, 5000); // 5 second lock
        if (!lockAcquired) {
            throw new auction_errors_1.AuctionError("BID_IN_PROGRESS", "Another bid is being processed. Please try again in a moment.");
        }
        try {
            // Check participant eligibility
            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (!participant) {
                throw new auction_errors_1.AuctionError("NOT_ALLOWED", "User not entered in auction");
            }
            if (participant.revokedAt) {
                throw new auction_errors_1.AuctionError("USER_REVOKED", "User revoked from auction");
            }
            return await this.transactionManager.runInTransaction(async (tx) => {
                const auction = await this.auctionRepository.findByIdForUpdate(auctionId, tx);
                if (!auction) {
                    throw new auction_errors_1.AuctionError("AUCTION_NOT_FOUND", "Auction not found");
                }
                const secondsRemaining = await redis_service_1.redisService.getSecondsUntilCanBid(auctionId, userId, auction.bidCooldownSeconds);
                if (secondsRemaining > 0) {
                    throw new auction_errors_1.AuctionError("RATE_LIMITED", `Please wait ${secondsRemaining} seconds before placing another bid`);
                }
                (0, auction_policy_1.ensureAuctionActive)(auction);
                (0, auction_policy_1.ensureAuctionWindow)(auction, new Date());
                if (auction.sellerId === userId) {
                    throw new auction_errors_1.AuctionError("NOT_ALLOWED", "Seller cannot bid");
                }
                (0, auction_policy_1.ensureBidAmount)(auction, amount);
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
                    console.log(`🕐 Anti-snipe: Auction ${auctionId} extended by ${auction.antiSnipeExtensionSeconds}s (extension ${newExtensionCount}/${auction.maxExtensions})`);
                    // Log extension activity
                    this.activityRepository.logActivity(auctionId, "AUCTION_EXTENDED", `Auction extended by ${auction.antiSnipeExtensionSeconds}s due to late bid (${newExtensionCount}/${auction.maxExtensions})`, userId, {
                        extensionNumber: newExtensionCount,
                        maxExtensions: auction.maxExtensions,
                        newEndTime: newEndTime.toISOString(),
                        triggerBidId: bid.id
                    }).catch(err => console.error('Failed to log extension activity:', err));
                }
                // Log bid activity
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
        }
        finally {
            // Always release the lock
            await redis_service_1.redisService.releaseLock(lockKey);
        }
    }
}
exports.PlaceBidUseCase = PlaceBidUseCase;
