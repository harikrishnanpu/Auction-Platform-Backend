import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { IBidRepository } from "@domain/entities/auction/repositories/bid.repository";
import { IAuctionParticipantRepository } from "@domain/entities/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { ITransactionManager } from "@application/ports/transaction.port";
import { ensureAuctionActive, ensureAuctionWindow, ensureBidAmount } from "@domain/entities/auction/auction.policy";
import { Result } from "@result/result";
import { redisService } from "@infrastructure/services/redis/redis.service";
import { IPlaceBidUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class PlaceBidUseCase implements IPlaceBidUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository,
        private transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, userId: string, amount: number): Promise<Result<any>> {
        const lockKey = `auction:${auctionId}:bid`;
        const lockAcquired = await redisService.acquireLock(lockKey, 5000);

        if (!lockAcquired) {
            return Result.fail("Another bid is being processed. Please try again in a moment.");
        }

        try {
            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (!participant) {
                return Result.fail("User not entered in auction");
            }
            if (participant.revokedAt) {
                return Result.fail("User revoked from auction");
            }

            const result = await this.transactionManager.runInTransaction(async (tx) => {
                const auction = await this.auctionRepository.findByIdForUpdate(auctionId, tx);
                if (!auction) {
                    return Result.fail("Auction not found");
                }

                const secondsRemaining = await redisService.getSecondsUntilCanBid(
                    auctionId,
                    userId,
                    auction.bidCooldownSeconds
                );
                if (secondsRemaining > 0) {
                    return Result.fail(`Please wait ${secondsRemaining} seconds before placing another bid`);
                }

                try {
                    ensureAuctionActive(auction);
                    ensureAuctionWindow(auction, new Date());
                } catch (e) {
                    return Result.fail((e as Error).message);
                }

                if (auction.sellerId === userId) {
                    return Result.fail("Seller cannot bid");
                }

                try {
                    ensureBidAmount(auction, amount);
                } catch (e) {
                    return Result.fail((e as Error).message);
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

                // Log bid activity (non-blocking)
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

            return Result.ok(result);
        } catch (error) {
            return Result.fail((error as Error).message);
        } finally {
            await redisService.releaseLock(lockKey);
        }
    }
}
