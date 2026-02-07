"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndAuctionUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class EndAuctionUseCase {
    constructor(auctionRepository, bidRepository, activityRepository, paymentRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.activityRepository = activityRepository;
        this.paymentRepository = paymentRepository;
    }
    async execute(auctionId, endedBy) {
        console.log(`🏁 Ending auction ${auctionId} by ${endedBy}`);
        // 1. Get auction
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new auction_errors_1.AuctionError('NOT_FOUND', 'Auction not found');
        }
        // 2. Check if auction is already ended
        if (auction.status === 'ENDED' || auction.status === 'CANCELLED') {
            console.log(`⚠️ Auction ${auctionId} is already ${auction.status}`);
            return {
                success: false,
                winnerId: null,
                winningBid: null,
                paymentDeadline: null
            };
        }
        // 3. Check if auction is active
        if (auction.status !== 'ACTIVE') {
            throw new auction_errors_1.AuctionError('INVALID_STATUS', 'Only active auctions can be ended');
        }
        // 4. Get all valid bids  
        const validBids = await this.bidRepository.findLatestValidByAuction(auctionId, 1000);
        let winnerId = null;
        let winningBid = null;
        let paymentDeadline = null;
        if (validBids.length > 0) {
            // Sort by amount (highest first)
            validBids.sort((a, b) => b.amount - a.amount);
            const highestBid = validBids[0];
            winnerId = highestBid.userId;
            winningBid = highestBid.amount;
            // Set payment deadline to 24 hours from now
            paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
            console.log(`🏆 Winner: ${winnerId}, Amount: ₹${winningBid}`);
            // 5. Update auction with winner
            await this.auctionRepository.update(auctionId, {
                status: 'ENDED',
                winnerId: winnerId,
                winnerPaymentDeadline: paymentDeadline,
                completionStatus: 'PENDING'
            });
            // 6. Create payment record (only if we have valid winner data)
            if (winnerId && winningBid) {
                await this.paymentRepository.create({
                    auctionId,
                    userId: winnerId,
                    amount: winningBid
                });
            }
            // 7. Log activity
            await this.activityRepository.logActivity(auctionId, 'AUCTION_ENDED', `Auction ended. Winner: ${winnerId}, Amount: ₹${winningBid}`, winnerId);
            console.log(`✅ Auction ${auctionId} ended with winner ${winnerId}`);
        }
        else {
            // No bids - auction failed
            await this.auctionRepository.update(auctionId, {
                status: 'ENDED',
                completionStatus: 'FAILED'
            });
            await this.activityRepository.logActivity(auctionId, 'AUCTION_ENDED', 'Auction ended with no bids', auction.sellerId);
            console.log(`❌ Auction ${auctionId} ended with no bids`);
        }
        return {
            success: true,
            winnerId,
            winningBid,
            paymentDeadline
        };
    }
}
exports.EndAuctionUseCase = EndAuctionUseCase;
