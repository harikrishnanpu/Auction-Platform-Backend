"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndAuctionUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class EndAuctionUseCase {
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
            throw new Error('Unauthorized: Only the seller can end this auction');
        }
        // Can only end active auctions
        if (auction.status !== 'ACTIVE') {
            throw new Error('Can only end active auctions');
        }
        // Update auction status to ENDED
        await this.auctionRepository.update(auctionId, { status: 'ENDED' });
    }
}
exports.EndAuctionUseCase = EndAuctionUseCase;
