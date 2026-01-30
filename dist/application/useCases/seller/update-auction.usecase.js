"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAuctionUseCase = void 0;
class UpdateAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(auctionId, sellerId, dto) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.sellerId !== sellerId) {
            throw new Error("Auction not found");
        }
        if (auction.status !== "DRAFT") {
            throw new Error("Only draft auctions can be updated");
        }
        const startAt = dto.startAt ? new Date(dto.startAt) : auction.startAt;
        const endAt = dto.endAt ? new Date(dto.endAt) : auction.endAt;
        if (endAt <= startAt) {
            throw new Error("End time must be after start time");
        }
        return await this.auctionRepository.update(auctionId, {
            title: dto.title ?? auction.title,
            description: dto.description ?? auction.description,
            startAt,
            endAt,
            startPrice: dto.startPrice ?? auction.startPrice,
            minBidIncrement: dto.minBidIncrement ?? auction.minBidIncrement,
        });
    }
}
exports.UpdateAuctionUseCase = UpdateAuctionUseCase;
