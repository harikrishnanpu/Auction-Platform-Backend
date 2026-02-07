"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespondToOfferUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class RespondToOfferUseCase {
    constructor(auctionRepository, bidRepository, offerRepository, paymentRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.offerRepository = offerRepository;
        this.paymentRepository = paymentRepository;
        this.activityRepository = activityRepository;
    }
    async execute(offerId, userId, response) {
        console.log(`📬 User ${userId} responding to offer ${offerId}: ${response}`);
        // 1. Get offer
        const offer = await this.offerRepository.findById(offerId);
        if (!offer) {
            throw new auction_errors_1.AuctionError('Offer not found', 'NOT_FOUND');
        }
        // 2. Check if user matches
        if (offer.userId !== userId) {
            throw new auction_errors_1.AuctionError('Unauthorized', 'NOT_ALLOWED');
        }
        // 3. Check if offer is pending
        if (offer.status !== 'PENDING') {
            throw new auction_errors_1.AuctionError('Offer is no longer available', 'INVALID_STATUS');
        }
        // 4. Check if expired
        if (new Date() > offer.expiresAt) {
            await this.offerRepository.update(offerId, {
                status: 'EXPIRED',
                respondedAt: new Date()
            });
            throw new auction_errors_1.AuctionError('Offer has expired', 'OFFER_EXPIRED');
        }
        const respondedAt = new Date();
        if (response === 'ACCEPT') {
            // ACCEPT: Make this user the new winner
            console.log(`✅ User ${userId} accepted offer for auction ${offer.auctionId}`);
            // 5. Update offer
            await this.offerRepository.update(offerId, {
                status: 'ACCEPTED',
                respondedAt
            });
            // 6. Update auction with new winner
            const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.auctionRepository.update(offer.auctionId, {
                winner_id: userId,
                winner_payment_deadline: paymentDeadline,
                completion_status: 'PENDING'
            });
            // 7. Create payment record
            await this.paymentRepository.create({
                auctionId: offer.auctionId,
                userId,
                amount: offer.bidAmount
            });
            // 8. Log activity
            await this.activityRepository.create({
                auctionId: offer.auctionId,
                userId,
                type: 'OFFER_ACCEPTED',
                description: `Offer accepted by ${userId}. New winner: ₹${offer.bidAmount}`
            });
            return { success: true, message: 'Offer accepted. You are now the winner!' };
        }
        else {
            // DECLINE: Offer to next bidder
            console.log(`❌ User ${userId} declined offer for auction ${offer.auctionId}`);
            // 5. Update offer
            await this.offerRepository.update(offerId, {
                status: 'DECLINED',
                respondedAt
            });
            // 6. Log activity
            await this.activityRepository.create({
                auctionId: offer.auctionId,
                userId,
                type: 'OFFER_DECLINED',
                description: `Offer declined by ${userId}`
            });
            // 7. Find next bidder
            const validBids = await this.bidRepository.findValidByAuction(offer.auctionId);
            const auction = await this.auctionRepository.findById(offer.auctionId);
            // Get existing offers to know which ranks are taken
            const existingOffers = await this.offerRepository.findByAuctionId(offer.auctionId);
            const declinedRanks = existingOffers
                .filter(o => o.status === 'DECLINED' || o.status === 'EXPIRED')
                .map(o => o.offerRank);
            const sortedBids = validBids
                .filter(bid => {
                // Exclude original winner and users who already declined
                const hasDeclinedOffer = existingOffers.some(o => o.userId === bid.userId && (o.status === 'DECLINED' || o.status === 'EXPIRED'));
                return bid.userId !== auction?.winner_id && !hasDeclinedOffer;
            })
                .sort((a, b) => b.amount - a.amount);
            const nextRank = offer.offerRank + 1;
            if (sortedBids.length > 0 && nextRank <= 5) {
                // Offer to next bidder (rank 3, 4, or 5)
                const nextBidder = sortedBids[0];
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await this.offerRepository.create({
                    auctionId: offer.auctionId,
                    userId: nextBidder.userId,
                    bidAmount: nextBidder.amount,
                    offerRank: nextRank,
                    expiresAt
                });
                await this.activityRepository.create({
                    auctionId: offer.auctionId,
                    userId: nextBidder.userId,
                    type: 'OFFER_CREATED',
                    description: `Offer created for bidder rank ${nextRank}: ₹${nextBidder.amount}`
                });
                console.log(`📨 Offer created for next bidder: ${nextBidder.userId} (rank ${nextRank})`);
            }
            else {
                // All top 5 declined or no more bidders - mark auction as FAILED
                await this.auctionRepository.update(offer.auctionId, {
                    completion_status: 'FAILED',
                    winner_id: null,
                    winner_payment_deadline: null
                });
                await this.activityRepository.create({
                    auctionId: offer.auctionId,
                    userId: auction?.sellerId || '',
                    type: 'AUCTION_FAILED',
                    description: 'All top bidders declined. Auction failed.'
                });
                console.log(`❌ Auction ${offer.auctionId} marked as FAILED`);
            }
            return { success: true, message: 'Offer declined' };
        }
    }
}
exports.RespondToOfferUseCase = RespondToOfferUseCase;
