import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { IBidRepository } from '../../../domain/auction/repositories/bid.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { IOfferRepository } from '../../../domain/offer/offer.repository';
import { ICriticalUserRepository } from '../../../domain/critical-user/critical-user.repository';
import { IActivityRepository } from '../../../domain/auction/repositories/activity.repository';

export class HandlePaymentExpiryUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private paymentRepository: IPaymentRepository,
        private offerRepository: IOfferRepository,
        private criticalUserRepository: ICriticalUserRepository,
        private activityRepository: IActivityRepository
    ) {}

    async execute(auctionId: string): Promise<void> {
        console.log(`⏰ Handling payment expiry for auction ${auctionId}`);

        // 1. Get auction
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || !auction.winner_id) {
            return;
        }

        // 2. Mark original winner as FAILED
        const payments = await this.paymentRepository.findByAuctionId(auctionId);
        const winnerPayment = payments.find(p => p.userId === auction.winner_id && p.status === 'PENDING');
        
        if (winnerPayment) {
            await this.paymentRepository.update(winnerPayment.id, {
                status: 'FAILED',
                failureReason: 'Payment deadline expired'
            });
        }

        // 3. Mark user as critical
        await this.criticalUserRepository.create({
            userId: auction.winner_id,
            auctionId,
            reason: 'Failed to complete payment within deadline',
            description: `User won auction ${auctionId} but did not pay within 24 hours`,
            severity: 'HIGH'
        });

        await this.criticalUserRepository.markUserAsCritical(auction.winner_id);

        await this.activityRepository.create({
            auctionId,
            userId: auction.winner_id,
            type: 'PAYMENT_EXPIRED',
            description: 'Winner failed to pay within deadline, marked as critical user'
        });

        console.log(`❌ User ${auction.winner_id} marked as critical`);

        // 4. Get all valid bids (excluding the failed winner)
        const validBids = await this.bidRepository.findValidByAuction(auctionId);
        const sortedBids = validBids
            .filter(bid => bid.userId !== auction.winner_id)
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

            await this.activityRepository.create({
                auctionId,
                userId: nextBidder.userId,
                type: 'OFFER_CREATED',
                description: `Offer created for 2nd highest bidder: ₹${nextBidder.amount}`
            });

            console.log(`✅ Offer created for user ${nextBidder.userId}`);
        } else {
            // No more bidders - mark auction as FAILED
            await this.auctionRepository.update(auctionId, {
                completion_status: 'FAILED',
                winner_id: null,
                winner_payment_deadline: null
            });

            await this.activityRepository.create({
                auctionId,
                userId: auction.sellerId,
                type: 'AUCTION_FAILED',
                description: 'No bidders available to fulfill auction'
            });

            console.log(`❌ Auction ${auctionId} marked as FAILED`);
        }
    }
}
