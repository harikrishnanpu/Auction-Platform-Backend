import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "@domain/entities/auction/repositories/participant.repository";
import { IBidRepository } from "@domain/entities/auction/repositories/bid.repository";
import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { ITransactionManager } from "@application/ports/transaction.port";
import { Result } from "@result/result";
import { IRevokeUserUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class RevokeUserUseCase implements IRevokeUserUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private bidRepository: IBidRepository,
        private activityRepository: IAuctionActivityRepository,
        private transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, actorId: string, userId: string): Promise<Result<any>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return Result.fail("Auction not found");
            }
            if (auction.sellerId !== actorId) {
                // In some cases, admins might also revoke users. 
                // For now, following the original logic of checking sellerId.
                return Result.fail("Only owner can revoke users");
            }

            const bidCount = await this.bidRepository.countUserBids(auctionId, userId);

            const result = await this.transactionManager.runInTransaction(async (tx) => {
                const participant = await this.participantRepository.revokeParticipant(auctionId, userId);

                let invalidatedCount = 0;
                let priceChanged = false;
                let newPrice = auction.currentPrice;

                if (bidCount > 0) {
                    invalidatedCount = await this.bidRepository.invalidateUserBids(auctionId, userId, tx);
                    const highestValidBid = await this.bidRepository.findHighestValidBid(auctionId, tx);

                    if (highestValidBid) {
                        newPrice = highestValidBid.amount;
                    } else {
                        newPrice = auction.startPrice;
                    }

                    if (newPrice !== auction.currentPrice) {
                        await this.auctionRepository.updateCurrentPrice(auctionId, newPrice, tx);
                        priceChanged = true;
                    }
                }

                await this.activityRepository.logActivity(
                    auctionId,
                    "USER_REVOKED",
                    `User revoked from auction. ${invalidatedCount} bid(s) invalidated.`,
                    userId,
                    {
                        actorId,
                        invalidatedBids: invalidatedCount,
                        priceChanged,
                        oldPrice: auction.currentPrice,
                        newPrice
                    }
                );

                return {
                    participant,
                    invalidatedBids: invalidatedCount,
                    priceChanged,
                    oldPrice: auction.currentPrice,
                    newPrice
                };
            });

            return Result.ok(result);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
