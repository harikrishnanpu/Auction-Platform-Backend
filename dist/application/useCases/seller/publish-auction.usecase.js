"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishAuctionUseCase = void 0;
class PublishAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(auctionId, sellerId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.sellerId !== sellerId) {
            throw new Error("Auction not found");
        }
        if (auction.status === 'ACTIVE') {
            return auction;
        }
        if (auction.status !== 'DRAFT') {
            throw new Error("Only draft auctions can be published");
        }
        if (!auction.assets?.length) {
            throw new Error("Add at least one image or video before publishing");
        }
        const now = new Date();
        if (auction.endAt <= now) {
            throw new Error("End time must be in the future");
        }
        if (auction.endAt <= auction.startAt) {
            throw new Error("End time must be after start time");
        }
        return await this.auctionRepository.updateStatus(auctionId, 'ACTIVE');
    }
}
exports.PublishAuctionUseCase = PublishAuctionUseCase;
