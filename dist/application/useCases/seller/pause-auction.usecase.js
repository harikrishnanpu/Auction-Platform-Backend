"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseAuctionUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class PauseAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(auctionId, sellerId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw auction_errors_1.AuctionError.notFound();
        }
        // Verify seller ownership
        if (auction.sellerId !== sellerId) {
            throw new Error('Unauthorized: Only the seller can pause this auction');
        }
        // Can only pause active, non-paused auctions
        if (auction.status !== 'ACTIVE') {
            throw new Error('Can only pause active auctions');
        }
        if (auction.isPaused) {
            throw new Error('Auction is already paused');
        }
        // Update auction to paused state
        await this.auctionRepository.update(auctionId, { isPaused: true });
    }
}
exports.PauseAuctionUseCase = PauseAuctionUseCase;
