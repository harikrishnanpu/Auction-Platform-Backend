import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { ITransactionManager } from "../../ports/transaction.port";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class RevokeUserUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private bidRepository: IBidRepository,
        private activityRepository: IAuctionActivityRepository,
        private transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, sellerId: string, userId: string) {
        // Verify auction and seller
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }
        if (auction.sellerId !== sellerId) {
            throw new AuctionError("NOT_ALLOWED", "Only owner can revoke users");
        }

        // Check if user has any bids
        const bidCount = await this.bidRepository.countUserBids(auctionId, userId);
        
        return await this.transactionManager.runInTransaction(async (tx) => {
            // Revoke participant
            const participant = await this.participantRepository.revokeParticipant(auctionId, userId);
            
            // Invalidate all user's bids
            let invalidatedCount = 0;
            let priceChanged = false;
            let newPrice = auction.currentPrice;
            
            if (bidCount > 0) {
                invalidatedCount = await this.bidRepository.invalidateUserBids(auctionId, userId, tx);
                
                // Find the highest valid bid after invalidation
                const highestValidBid = await this.bidRepository.findHighestValidBid(auctionId, tx);
                
                if (highestValidBid) {
                    newPrice = highestValidBid.amount;
                } else {
                    // No valid bids left, reset to start price
                    newPrice = auction.startPrice;
                }
                
                // Update auction current price if it changed
                if (newPrice !== auction.currentPrice) {
                    await this.auctionRepository.updateCurrentPrice(auctionId, newPrice, tx);
                    priceChanged = true;
                }
            }
            
            // Log activity
            await this.activityRepository.logActivity(
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
