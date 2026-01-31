"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeUserUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const auction_messages_1 = require("../../../application/constants/auction.messages");
class RevokeUserUseCase {
    constructor(_auctionRepository, _participantRepository, _bidRepository, _activityRepository, _transactionManager) {
        this._auctionRepository = _auctionRepository;
        this._participantRepository = _participantRepository;
        this._bidRepository = _bidRepository;
        this._activityRepository = _activityRepository;
        this._transactionManager = _transactionManager;
    }
    async execute(auctionId, sellerId, userId) {
        // Verify auction and seller
        const auction = await this._auctionRepository.findById(auctionId);
        if (!auction) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.AUCTION_NOT_FOUND, auction_messages_1.AuctionMessages.AUCTION_NOT_FOUND);
        }
        if (auction.sellerId !== sellerId) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, auction_messages_1.AuctionMessages.NOT_ALLOWED);
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
                }
                else {
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
            await this._activityRepository.logActivity(auctionId, "USER_REVOKED", `User revoked from auction. ${invalidatedCount} bid(s) invalidated.`, userId, {
                sellerId,
                invalidatedBids: invalidatedCount,
                priceChanged,
                oldPrice: auction.currentPrice,
                newPrice
            });
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
exports.RevokeUserUseCase = RevokeUserUseCase;
