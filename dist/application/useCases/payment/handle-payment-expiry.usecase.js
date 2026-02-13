"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlePaymentExpiryUseCase = void 0;
class HandlePaymentExpiryUseCase {
    constructor(auctionRepository, bidRepository, paymentRepository, offerRepository, criticalUserRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.paymentRepository = paymentRepository;
        this.offerRepository = offerRepository;
        this.criticalUserRepository = criticalUserRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId) {
        console.log(`⏰ Handling payment expiry for auction ${auctionId}`);
        // 1. Get auction
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || !auction.winnerId) {
            return;
        }
        // 2. Mark original winner as FAILED
        const payments = await this.paymentRepository.findByAuctionId(auctionId);
        const winnerPayment = payments.find(p => p.userId === auction.winnerId && p.status === 'PENDING');
        if (winnerPayment) {
            await this.paymentRepository.update(winnerPayment.id, {
                status: 'FAILED',
                failureReason: 'Payment deadline expired'
            });
        }
        // 3. Mark user as critical
        await this.criticalUserRepository.create({
            userId: auction.winnerId,
            auctionId,
            reason: 'Failed to complete payment within deadline',
            description: `User won auction ${auctionId} but did not pay within 24 hours`,
            severity: 'HIGH'
        });
        await this.criticalUserRepository.markUserAsCritical(auction.winnerId);
        await this.activityRepository.logActivity(auctionId, 'PAYMENT_EXPIRED', 'Winner failed to pay within deadline, marked as critical user', auction.winnerId);
        console.log(`❌ User ${auction.winnerId} marked as critical`);
        // 4. Get all valid bids (excluding the failed winner)
        const validBids = await this.bidRepository.findLatestValidByAuction(auctionId, 1000);
        const sortedBids = validBids
            .filter((bid) => bid.userId !== auction.winnerId)
            .sort((a, b) => b.amount - a.amount);
        // 5. Offer to 2nd-5th highest bidders
        const topBidders = sortedBids.slice(0, 5);
        if (topBidders.length > 0) {
            console.log(`📨 Offering to next ${topBidders.length} highest bidders`);
            // Create offer for 2nd highest (rank 2)
            const nextBidder = topBidders[0];
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await this.offerRepository.create({
                auctionId,
                userId: nextBidder.userId,
                bidAmount: nextBidder.amount,
                offerRank: 2,
                expiresAt
            });
            await this.activityRepository.logActivity(auctionId, 'OFFER_CREATED', `Offer created for 2nd highest bidder: ₹${nextBidder.amount}`, nextBidder.userId);
            console.log(`✅ Offer created for user ${nextBidder.userId}`);
        }
        else {
            // No more bidders - mark auction as FAILED
            await this.auctionRepository.update(auctionId, {
                completionStatus: 'FAILED',
                winnerId: null,
                winnerPaymentDeadline: null
            });
            await this.activityRepository.logActivity(auctionId, 'AUCTION_FAILED', 'No bidders available to fulfill auction', auction.sellerId);
            console.log(`❌ Auction ${auctionId} marked as FAILED`);
        }
    }
}
exports.HandlePaymentExpiryUseCase = HandlePaymentExpiryUseCase;
