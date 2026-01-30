"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBidUseCase = void 0;
class CreateBidUseCase {
    constructor(auctionRepository, bidRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
    }
    async execute(auctionId, userId, amount) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.status !== 'ACTIVE') {
            throw new Error("Auction not available");
        }
        const minRequired = auction.currentPrice + auction.minBidIncrement;
        if (amount < minRequired) {
            throw new Error(`Bid must be at least ${minRequired}`);
        }
        return await this.bidRepository.createBid(auctionId, userId, amount);
    }
}
exports.CreateBidUseCase = CreateBidUseCase;
