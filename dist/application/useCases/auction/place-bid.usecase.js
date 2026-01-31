"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceBidUseCase = void 0;
const auction_policy_1 = require("../../../domain/auction/auction.policy");
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const auction_messages_1 = require("../../../application/constants/auction.messages");
const redis_service_1 = require("../../../infrastructure/services/redis/redis.service");
const ANTI_SNIPE_THRESHOLD_SECONDS = 30; // Extend if bid within last 30 seconds
const ANTI_SNIPE_EXTENSION_SECONDS = 30; // Extend by 30 seconds
const MAX_EXTENSIONS = 5; // Maximum 5 extensions
const RATE_LIMIT_SECONDS = 60; // 1 bid per minute
class PlaceBidUseCase {
    constructor(_auctionRepository, _bidRepository, _participantRepository, _activityRepository, _transactionManager) {
        this._auctionRepository = _auctionRepository;
        this._bidRepository = _bidRepository;
        this._participantRepository = _participantRepository;
        this._activityRepository = _activityRepository;
        this._transactionManager = _transactionManager;
    }
    async execute(auctionId, userId, amount) {
        const secondsRemaining = await redis_service_1.redisService.getSecondsUntilCanBid(auctionId, userId);
        if (secondsRemaining > 0) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.RATE_LIMITED, `${auction_messages_1.AuctionMessages.RATE_LIMITED} ${secondsRemaining} seconds before placing another bid`);
        }
        // Acquire distributed lock for this auction
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redis_service_1.redisService.acquireLock(lockKey, 5000); // 5 second lock
        if (!lockAcquired) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.BID_IN_PROGRESS, auction_messages_1.AuctionMessages.BID_IN_PROGRESS);
        }
        try {
            // Check participant eligibility
            const participant = await this._participantRepository.findByAuctionAndUser(auctionId, userId);
            if (!participant) {
                throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, auction_messages_1.AuctionMessages.USER_NOT_ENTERED);
            }
            if (participant.revokedAt) {
                throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.USER_REVOKED, auction_messages_1.AuctionMessages.USER_REVOKED);
            }
            return await this._transactionManager.runInTransaction(async (tx) => {
                const auction = await this._auctionRepository.findByIdForUpdate(auctionId, tx);
                if (!auction) {
                    throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.AUCTION_NOT_FOUND, auction_messages_1.AuctionMessages.AUCTION_NOT_FOUND);
                }
                (0, auction_policy_1.ensureAuctionActive)(auction);
                (0, auction_policy_1.ensureAuctionWindow)(auction, new Date());
                if (auction.sellerId === userId) {
                    throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, auction_messages_1.AuctionMessages.SELLER_CANNOT_BID);
                }
                (0, auction_policy_1.ensureBidAmount)(auction, amount);
                // Create bid
                const bid = await this._bidRepository.createBid(auctionId, userId, amount, tx);
                await this._auctionRepository.updateCurrentPrice(auctionId, amount, tx);
                // Check for anti-sniping extension
                const now = new Date();
                const endTime = new Date(auction.endAt);
                const secondsRemaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
                let extended = false;
                let newEndTime = endTime;
                if (secondsRemaining > 0 && secondsRemaining <= ANTI_SNIPE_THRESHOLD_SECONDS && auction.extensionCount < MAX_EXTENSIONS) {
                    // Extend auction by 30 seconds
                    newEndTime = new Date(endTime.getTime() + (ANTI_SNIPE_EXTENSION_SECONDS * 1000));
                    const newExtensionCount = auction.extensionCount + 1;
                    await this._auctionRepository.extendAuction(auctionId, newEndTime, newExtensionCount, tx);
                    extended = true;
                    console.log(`🕐 Anti-snipe: Auction ${auctionId} extended by ${ANTI_SNIPE_EXTENSION_SECONDS}s (extension ${newExtensionCount}/${MAX_EXTENSIONS})`);
                    // Log extension activity
                    this._activityRepository.logActivity(auctionId, "AUCTION_EXTENDED", `Auction extended by ${ANTI_SNIPE_EXTENSION_SECONDS}s due to late bid (${newExtensionCount}/${MAX_EXTENSIONS})`, userId, {
                        extensionNumber: newExtensionCount,
                        maxExtensions: MAX_EXTENSIONS,
                        newEndTime: newEndTime.toISOString(),
                        triggerBidId: bid.id
                    }).catch(err => console.error('Failed to log extension activity:', err));
                }
                // Log bid activity
                this._activityRepository.logActivity(auctionId, "BID_PLACED", `New bid placed: ₹${amount.toLocaleString()}`, userId, { bidId: bid.id, amount, extended }).catch(err => console.error('Failed to log bid activity:', err));
                // Record bid timestamp for rate limiting
                await redis_service_1.redisService.recordBid(auctionId, userId);
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
