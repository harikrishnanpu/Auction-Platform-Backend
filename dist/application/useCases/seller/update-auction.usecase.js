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
        const antiSnipeThresholdSeconds = dto.antiSnipeThresholdSeconds ?? auction.antiSnipeThresholdSeconds;
        const antiSnipeExtensionSeconds = dto.antiSnipeExtensionSeconds ?? auction.antiSnipeExtensionSeconds;
        const maxExtensions = dto.maxExtensions ?? auction.maxExtensions;
        const bidCooldownSeconds = dto.bidCooldownSeconds ?? auction.bidCooldownSeconds;
        const allowedThresholds = [30, 60];
        const allowedExtensions = [30, 60];
        const allowedMaxExtensions = [3, 5, 10];
        const allowedCooldowns = [30, 60];
        if (!allowedThresholds.includes(antiSnipeThresholdSeconds)) {
            throw new Error("Invalid anti-snipe threshold");
        }
        if (!allowedExtensions.includes(antiSnipeExtensionSeconds)) {
            throw new Error("Invalid anti-snipe extension");
        }
        if (!allowedMaxExtensions.includes(maxExtensions)) {
            throw new Error("Invalid max extensions");
        }
        if (!allowedCooldowns.includes(bidCooldownSeconds)) {
            throw new Error("Invalid bid cooldown");
        }
        return await this.auctionRepository.update(auctionId, {
            title: dto.title ?? auction.title,
            description: dto.description ?? auction.description,
            startAt,
            endAt,
            startPrice: dto.startPrice ?? auction.startPrice,
            minBidIncrement: dto.minBidIncrement ?? auction.minBidIncrement,
            antiSnipeThresholdSeconds,
            antiSnipeExtensionSeconds,
            maxExtensions,
            bidCooldownSeconds
        });
    }
}
exports.UpdateAuctionUseCase = UpdateAuctionUseCase;
