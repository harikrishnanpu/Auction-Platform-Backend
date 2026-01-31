"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndAuctionUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const auction_messages_1 = require("../../../application/constants/auction.messages");
class EndAuctionUseCase {
    constructor(_auctionRepository) {
        this._auctionRepository = _auctionRepository;
    }
    async execute(auctionId, sellerId) {
        const auction = await this._auctionRepository.findById(auctionId);
        if (!auction) {
            throw auction_errors_1.AuctionError.notFound();
        }
        // Verify seller ownership
        if (auction.sellerId !== sellerId) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, auction_messages_1.AuctionMessages.NOT_ALLOWED);
        }
        // Can only end active auctions
        if (auction.status !== 'ACTIVE') {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.INVALID_STATUS, 'Can only end active auctions');
        }
        // Update auction status to ENDED
        await this._auctionRepository.update(auctionId, { status: 'ENDED' });
    }
}
exports.EndAuctionUseCase = EndAuctionUseCase;
