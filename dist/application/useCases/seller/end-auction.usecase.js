"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndAuctionUseCase = void 0;
const result_1 = require("@result/result");
class EndAuctionUseCase {
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
                return result_1.Result.fail("Unauthorized: Only the seller can end this auction");
            }
            if (auction.status !== 'ACTIVE') {
                return result_1.Result.fail("Can only end active auctions");
            }
            await this.auctionRepository.update(auctionId, { status: 'ENDED' });
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.EndAuctionUseCase = EndAuctionUseCase;
