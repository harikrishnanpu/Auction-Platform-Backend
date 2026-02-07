import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { ITransactionManager } from "../../ports/transaction.port";
import { ensureAuctionActive, ensureAuctionWindow, ensureBidAmount } from "../../../domain/auction/auction.policy";
import { AuctionError } from "../../../domain/auction/auction.errors";
import { redisService } from "../../../infrastructure/services/redis/redis.service";

export class PlaceBidUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository,
        private transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, userId: string, amount: number) {
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redisService.acquireLock(lockKey, 5000);

        if (!lockAcquired) {
            throw new AuctionError(
                "BID_IN_PROGRESS",
                "Another bid is being processed. Please try again in a moment."
            );
        }

        try {

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

                const secondsRemaining = await redisService.getSecondsUntilCanBid(
                    auctionId,
                    userId,
                    auction.bidCooldownSeconds
                );
                if (secondsRemaining > 0) {
                    throw new AuctionError(
                        "RATE_LIMITED",
                        `Please wait ${secondsRemaining} seconds before placing another bid`
                    );
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
                    this.activityRepository.logActivity(
                        auctionId,
                        "AUCTION_EXTENDED",
                        `Auction extended by ${auction.antiSnipeExtensionSeconds}s due to late bid (${newExtensionCount}/${auction.maxExtensions})`,
                        userId,
                        {
                            extensionNumber: newExtensionCount,
                            maxExtensions: auction.maxExtensions,
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
                await redisService.recordBid(auctionId, userId, auction.bidCooldownSeconds);

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
