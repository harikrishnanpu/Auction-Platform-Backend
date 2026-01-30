import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { ITransactionManager } from "../../ports/transaction.port";
import { ensureAuctionActive, ensureAuctionWindow, ensureBidAmount } from "../../../domain/auction/auction.policy";
import { AuctionError } from "../../../domain/auction/auction.errors";
import { redisService } from "../../../infrastructure/services/redis/redis.service";

const ANTI_SNIPE_THRESHOLD_SECONDS = 30; // Extend if bid within last 30 seconds
const ANTI_SNIPE_EXTENSION_SECONDS = 30; // Extend by 30 seconds
const MAX_EXTENSIONS = 5; // Maximum 5 extensions
const RATE_LIMIT_SECONDS = 60; // 1 bid per minute

export class PlaceBidUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository,
        private transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, userId: string, amount: number) {
        // Check rate limiting (1 bid per minute)
        const secondsRemaining = await redisService.getSecondsUntilCanBid(auctionId, userId);
        if (secondsRemaining > 0) {
            throw new AuctionError(
                "RATE_LIMITED",
                `Please wait ${secondsRemaining} seconds before placing another bid`
            );
        }

        // Acquire distributed lock for this auction
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redisService.acquireLock(lockKey, 5000); // 5 second lock
        
        if (!lockAcquired) {
            throw new AuctionError(
                "BID_IN_PROGRESS",
                "Another bid is being processed. Please try again in a moment."
            );
        }

        try {
            // Check participant eligibility
            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (!participant) {
                throw new AuctionError("NOT_ALLOWED", "User not entered in auction");
            }
            if (participant.revokedAt) {
                throw new AuctionError("USER_REVOKED", "User revoked from auction");
            }

            return await this.transactionManager.runInTransaction(async (tx) => {
                const auction = await this.auctionRepository.findByIdForUpdate(auctionId, tx);
                if (!auction) {
                    throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
                }

                ensureAuctionActive(auction);
                ensureAuctionWindow(auction, new Date());

                if (auction.sellerId === userId) {
                    throw new AuctionError("NOT_ALLOWED", "Seller cannot bid");
                }

                ensureBidAmount(auction, amount);

                // Create bid
                const bid = await this.bidRepository.createBid(auctionId, userId, amount, tx);
                await this.auctionRepository.updateCurrentPrice(auctionId, amount, tx);

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
                    
                    await this.auctionRepository.extendAuction(auctionId, newEndTime, newExtensionCount, tx);
                    extended = true;

                    console.log(`🕐 Anti-snipe: Auction ${auctionId} extended by ${ANTI_SNIPE_EXTENSION_SECONDS}s (extension ${newExtensionCount}/${MAX_EXTENSIONS})`);

                    // Log extension activity
                    this.activityRepository.logActivity(
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
                this.activityRepository.logActivity(
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
