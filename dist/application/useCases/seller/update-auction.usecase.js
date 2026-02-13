"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAuctionUseCase = void 0;
const result_1 = require("@result/result");
class UpdateAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(sellerId, auctionId, dto) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.status !== "DRAFT") {
                return result_1.Result.fail("Only draft auctions can be updated");
            }
            const startAt = dto.startAt ? new Date(dto.startAt) : auction.startAt;
            const endAt = dto.endAt ? new Date(dto.endAt) : auction.endAt;
            if (endAt <= startAt) {
                return result_1.Result.fail("End time must be after start time");
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
                return result_1.Result.fail("Invalid anti-snipe threshold");
            }
            if (!allowedExtensions.includes(antiSnipeExtensionSeconds)) {
                return result_1.Result.fail("Invalid anti-snipe extension");
            }
            if (!allowedMaxExtensions.includes(maxExtensions)) {
                return result_1.Result.fail("Invalid max extensions");
            }
            if (!allowedCooldowns.includes(bidCooldownSeconds)) {
                return result_1.Result.fail("Invalid bid cooldown");
            }
            const updatedAuction = await this.auctionRepository.update(auctionId, {
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
            return result_1.Result.ok(updatedAuction);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.UpdateAuctionUseCase = UpdateAuctionUseCase;
