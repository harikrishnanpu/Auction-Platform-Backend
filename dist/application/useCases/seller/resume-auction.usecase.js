"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeAuctionUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class ResumeAuctionUseCase {
    constructor(auctionRepository, endAuctionUseCase) {
        this.auctionRepository = auctionRepository;
        this.endAuctionUseCase = endAuctionUseCase;
    }
    async execute(auctionId, sellerId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw auction_errors_1.AuctionError.notFound();
        }
        // Verify seller ownership
        if (auction.sellerId !== sellerId) {
            throw new Error('Unauthorized: Only the seller can resume this auction');
        }
        // Can only resume paused auctions
        if (auction.status !== 'ACTIVE') {
            throw new Error('Can only resume active auctions');
        }
        if (!auction.isPaused) {
            throw new Error('Auction is not paused');
        }
        const now = new Date();
        if (auction.endAt <= now) {
            await this.endAuctionUseCase.execute(auctionId, 'SYSTEM');
            return;
        }
        await this.auctionRepository.update(auctionId, { isPaused: false });
    }
}
exports.ResumeAuctionUseCase = ResumeAuctionUseCase;
