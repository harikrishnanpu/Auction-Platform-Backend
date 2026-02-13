"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndAuctionUseCase = void 0;
const result_1 = require("@result/result");
class EndAuctionUseCase {
    constructor(auctionRepository, bidRepository, activityRepository, paymentRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.activityRepository = activityRepository;
        this.paymentRepository = paymentRepository;
    }
    async execute(auctionId, endedBy) {
        try {
            console.log(`🏁 Ending auction ${auctionId} by ${endedBy}`);
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.status === 'ENDED' || auction.status === 'CANCELLED') {
                console.log(`⚠️ Auction ${auctionId} is already ${auction.status}`);
                return result_1.Result.ok({
                    success: false,
                    winnerId: null,
                    winningBid: null,
                    paymentDeadline: null
                });
            }
            if (auction.status !== 'ACTIVE') {
                return result_1.Result.fail("Only active auctions can be ended");
            }
            const validBids = await this.bidRepository.findLatestValidByAuction(auctionId, 1000);
            let winnerId = null;
            let winningBid = null;
            let paymentDeadline = null;
            if (validBids.length > 0) {
                validBids.sort((a, b) => b.amount - a.amount);
                const highestBid = validBids[0];
                winnerId = highestBid.userId;
                winningBid = highestBid.amount;
                paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
                console.log(`🏆 Winner: ${winnerId}, Amount: ₹${winningBid}`);
                await this.auctionRepository.update(auctionId, {
                    status: 'ENDED',
                    winnerId: winnerId,
                    winnerPaymentDeadline: paymentDeadline,
                    completionStatus: 'PENDING'
                });
                if (winnerId && winningBid) {
                    await this.paymentRepository.create({
                        auctionId,
                        userId: winnerId,
                        amount: winningBid
                    });
                }
                await this.activityRepository.logActivity(auctionId, 'AUCTION_ENDED', `Auction ended. Winner: ${winnerId}, Amount: ₹${winningBid}`, winnerId);
                console.log(`✅ Auction ${auctionId} ended with winner ${winnerId}`);
            }
            else {
                await this.auctionRepository.update(auctionId, {
                    status: 'ENDED',
                    completionStatus: 'FAILED'
                });
                await this.activityRepository.logActivity(auctionId, 'AUCTION_ENDED', 'Auction ended with no bids', auction.sellerId);
                console.log(`❌ Auction ${auctionId} ended with no bids`);
            }
            return result_1.Result.ok({
                success: true,
                winnerId,
                winningBid,
                paymentDeadline
            });
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.EndAuctionUseCase = EndAuctionUseCase;
