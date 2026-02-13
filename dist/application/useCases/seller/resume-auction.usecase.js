"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeAuctionUseCase = void 0;
const result_1 = require("@result/result");
class ResumeAuctionUseCase {
    constructor(auctionRepository, endAuctionUseCase) {
        this.auctionRepository = auctionRepository;
        this.endAuctionUseCase = endAuctionUseCase;
    }
    async execute(sellerId, auctionId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.sellerId !== sellerId) {
                return result_1.Result.fail("Unauthorized: Only the seller can resume this auction");
            }
            if (auction.status !== 'ACTIVE') {
                return result_1.Result.fail("Can only resume active auctions");
            }
            if (!auction.isPaused) {
                return result_1.Result.fail("Auction is not paused");
            }
            const now = new Date();
            if (auction.endAt <= now) {
                await this.endAuctionUseCase.execute(auctionId, 'SYSTEM');
                return result_1.Result.ok(undefined);
            }
            await this.auctionRepository.update(auctionId, { isPaused: false });
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.ResumeAuctionUseCase = ResumeAuctionUseCase;
