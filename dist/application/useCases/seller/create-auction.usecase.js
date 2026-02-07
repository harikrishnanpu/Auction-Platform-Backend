"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuctionUseCase = void 0;
const auction_entity_1 = require("../../../domain/auction/auction.entity");
const uuid_1 = require("uuid");
class CreateAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(dto) {
        const start = new Date(dto.startAt);
        const end = new Date(dto.endAt);
        if (end <= start) {
            throw new Error("End time must be after start time");
        }
        const antiSnipeThresholdSeconds = dto.antiSnipeThresholdSeconds ?? 30;
        const antiSnipeExtensionSeconds = dto.antiSnipeExtensionSeconds ?? 30;
        const maxExtensions = dto.maxExtensions ?? 5;
        const bidCooldownSeconds = dto.bidCooldownSeconds ?? 60;
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
        const auctionId = (0, uuid_1.v4)();
        const auction = new auction_entity_1.Auction(auctionId, dto.sellerId, dto.categoryId || null, dto.conditionId || null, dto.title, dto.description, start, end, dto.startPrice, dto.minBidIncrement, dto.startPrice, [], 'DRAFT', false, 0, antiSnipeThresholdSeconds, antiSnipeExtensionSeconds, maxExtensions, bidCooldownSeconds);
        return await this.auctionRepository.create(auction);
    }
}
exports.CreateAuctionUseCase = CreateAuctionUseCase;
