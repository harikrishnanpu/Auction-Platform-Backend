import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { ITransactionManager } from "../../ports/transaction.port";
import { AuctionError, AuctionErrorCode } from "../../../domain/auction/auction.errors";
import { AuctionMessages } from "../../../application/constants/auction.messages";

export class RevokeUserUseCase {
    constructor(
        private _auctionRepository: IAuctionRepository,
        private _participantRepository: IAuctionParticipantRepository,
        private _bidRepository: IBidRepository,
        private _activityRepository: IAuctionActivityRepository,
        private _transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, sellerId: string, userId: string) {
        // Verify auction and seller
        const auction = await this._auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError(AuctionErrorCode.AUCTION_NOT_FOUND, AuctionMessages.AUCTION_NOT_FOUND);
        }
        if (auction.sellerId !== sellerId) {
            throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, AuctionMessages.NOT_ALLOWED);
        }

        // Check if user has any bids
        const bidCount = await this._bidRepository.countUserBids(auctionId, userId);

        return await this._transactionManager.runInTransaction(async (tx) => {
            // Revoke participant
            const participant = await this._participantRepository.revokeParticipant(auctionId, userId);

            // Invalidate all user's bids
            let invalidatedCount = 0;
            let priceChanged = false;
            let newPrice = auction.currentPrice;

            if (bidCount > 0) {
                invalidatedCount = await this._bidRepository.invalidateUserBids(auctionId, userId, tx);

                // Find the highest valid bid after invalidation
                const highestValidBid = await this._bidRepository.findHighestValidBid(auctionId, tx);

                if (highestValidBid) {
                    newPrice = highestValidBid.amount;
                } else {
                    // No valid bids left, reset to start price
                    newPrice = auction.startPrice;
                }

                // Update auction current price if it changed
                if (newPrice !== auction.currentPrice) {
                    await this._auctionRepository.updateCurrentPrice(auctionId, newPrice, tx);
                    priceChanged = true;
                }
            }

            // Log activity
            await this._activityRepository.logActivity(
                auctionId,
                "USER_REVOKED",
                `User revoked from auction. ${invalidatedCount} bid(s) invalidated.`,
                userId,
                {
                    sellerId,
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
    }
}

