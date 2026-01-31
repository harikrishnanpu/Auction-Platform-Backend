import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { ITransactionManager } from "../../ports/transaction.port";
import { ensureAuctionActive, ensureAuctionWindow, ensureBidAmount } from "../../../domain/auction/auction.policy";
import { AuctionError, AuctionErrorCode } from "../../../domain/auction/auction.errors";
import { AuctionMessages } from "../../../application/constants/auction.messages";
import { redisService } from "../../../infrastructure/services/redis/redis.service";

const ANTI_SNIPE_THRESHOLD_SECONDS = 30; // Extend if bid within last 30 seconds
const ANTI_SNIPE_EXTENSION_SECONDS = 30; // Extend by 30 seconds
const MAX_EXTENSIONS = 5; // Maximum 5 extensions
const RATE_LIMIT_SECONDS = 60; // 1 bid per minute

export class PlaceBidUseCase {
    constructor(
        private _auctionRepository: IAuctionRepository,
        private _bidRepository: IBidRepository,
        private _participantRepository: IAuctionParticipantRepository,
        private _activityRepository: IAuctionActivityRepository,
        private _transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, userId: string, amount: number) {

        const secondsRemaining = await redisService.getSecondsUntilCanBid(auctionId, userId);
        if (secondsRemaining > 0) {
            throw new AuctionError(
                AuctionErrorCode.RATE_LIMITED,
                `${AuctionMessages.RATE_LIMITED} ${secondsRemaining} seconds before placing another bid`
            );
        }

        // Acquire distributed lock for this auction
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redisService.acquireLock(lockKey, 5000); // 5 second lock

        if (!lockAcquired) {
            throw new AuctionError(
                AuctionErrorCode.BID_IN_PROGRESS,
                AuctionMessages.BID_IN_PROGRESS
            );
        }

        try {
            // Check participant eligibility
            const participant = await this._participantRepository.findByAuctionAndUser(auctionId, userId);
            if (!participant) {
                throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, AuctionMessages.USER_NOT_ENTERED);
            }
            if (participant.revokedAt) {
                throw new AuctionError(AuctionErrorCode.USER_REVOKED, AuctionMessages.USER_REVOKED);
            }

            return await this._transactionManager.runInTransaction(async (tx) => {
                const auction = await this._auctionRepository.findByIdForUpdate(auctionId, tx);
                if (!auction) {
                    throw new AuctionError(AuctionErrorCode.AUCTION_NOT_FOUND, AuctionMessages.AUCTION_NOT_FOUND);
                }

                ensureAuctionActive(auction);
                ensureAuctionWindow(auction, new Date());

                if (auction.sellerId === userId) {
                    throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, AuctionMessages.SELLER_CANNOT_BID);
                }

                ensureBidAmount(auction, amount);

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
                    this._activityRepository.logActivity(
                        auctionId,
                        "AUCTION_EXTENDED",
                        `Auction extended by ${ANTI_SNIPE_EXTENSION_SECONDS}s due to late bid (${newExtensionCount}/${MAX_EXTENSIONS})`,
                        userId,
                        {
                            extensionNumber: newExtensionCount,
                            maxExtensions: MAX_EXTENSIONS,
                            newEndTime: newEndTime.toISOString(),
                            triggerBidId: bid.id
                        }
                    ).catch(err => console.error('Failed to log extension activity:', err));
                }

                // Log bid activity
                this._activityRepository.logActivity(
                    auctionId,
                    "BID_PLACED",
                    `New bid placed: ₹${amount.toLocaleString()}`,
                    userId,
                    { bidId: bid.id, amount, extended }
                ).catch(err => console.error('Failed to log bid activity:', err));

                // Record bid timestamp for rate limiting
                await redisService.recordBid(auctionId, userId);

                return {
                    bid,
                    extended,
                    newEndTime: extended ? newEndTime : endTime,
                    extensionCount: extended ? auction.extensionCount + 1 : auction.extensionCount
                };
            });
        } finally {
            // Always release the lock
            await redisService.releaseLock(lockKey);
        }
    }
}

