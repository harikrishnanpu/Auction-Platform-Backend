"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishAuctionUseCase = void 0;
const result_1 = require("@result/result");
class PublishAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(sellerId, auctionId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.status === 'ACTIVE') {
                return result_1.Result.ok(undefined);
            }
            if (auction.status !== 'DRAFT') {
                return result_1.Result.fail("Only draft auctions can be published");
            }
            if (!auction.assets?.length) {
                return result_1.Result.fail("Add at least one image or video before publishing");
            }
            const now = new Date();
            if (auction.endAt <= now) {
                return result_1.Result.fail("End time must be in the future");
            }
            if (auction.endAt <= auction.startAt) {
                return result_1.Result.fail("End time must be after start time");
            }
            await this.auctionRepository.updateStatus(auctionId, 'ACTIVE');
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.PublishAuctionUseCase = PublishAuctionUseCase;
