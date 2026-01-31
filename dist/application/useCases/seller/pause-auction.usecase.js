"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseAuctionUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const auction_messages_1 = require("../../../application/constants/auction.messages");
class PauseAuctionUseCase {
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
        // Can only pause active, non-paused auctions
        if (auction.status !== 'ACTIVE') {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.INVALID_STATUS, 'Can only pause active auctions');
        }
        if (auction.isPaused) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.INVALID_STATUS, 'Auction is already paused');
        }
        // Update auction to paused state
        await this._auctionRepository.update(auctionId, { isPaused: true });
    }
}
exports.PauseAuctionUseCase = PauseAuctionUseCase;
