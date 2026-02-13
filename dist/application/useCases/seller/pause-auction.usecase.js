"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseAuctionUseCase = void 0;
const result_1 = require("@result/result");
class PauseAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(sellerId, auctionId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.sellerId !== sellerId) {
                return result_1.Result.fail("Unauthorized: Only the seller can pause this auction");
            }
            if (auction.status !== 'ACTIVE') {
                return result_1.Result.fail("Can only pause active auctions");
            }
            if (auction.isPaused) {
                return result_1.Result.fail("Auction is already paused");
            }
            await this.auctionRepository.update(auctionId, { isPaused: true });
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.PauseAuctionUseCase = PauseAuctionUseCase;
