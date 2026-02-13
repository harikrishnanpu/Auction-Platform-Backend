"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuctionUseCase = void 0;
const auction_entity_1 = require("@domain/entities/auction/auction.entity");
const uuid_1 = require("uuid");
const result_1 = require("@result/result");
class CreateAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(sellerId, data) {
        try {
            const start = new Date(data.startAt);
            const end = new Date(data.endAt);
            if (end <= start) {
                return result_1.Result.fail("End time must be after start time");
            }
            const antiSnipeThresholdSeconds = data.antiSnipeThresholdSeconds ?? 30;
            const antiSnipeExtensionSeconds = data.antiSnipeExtensionSeconds ?? 30;
            const maxExtensions = data.maxExtensions ?? 5;
            const bidCooldownSeconds = data.bidCooldownSeconds ?? 60;
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
            const auctionId = (0, uuid_1.v4)();
            const auction = new auction_entity_1.Auction(auctionId, sellerId, data.categoryId || null, data.conditionId || null, data.title, data.description, start, end, data.startPrice, data.minBidIncrement, data.startPrice, [], 'DRAFT', false, null, null, 'PENDING', 0, antiSnipeThresholdSeconds, antiSnipeExtensionSeconds, maxExtensions, bidCooldownSeconds);
            const createdAuction = await this.auctionRepository.create(auction);
            return result_1.Result.ok(createdAuction);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.CreateAuctionUseCase = CreateAuctionUseCase;
