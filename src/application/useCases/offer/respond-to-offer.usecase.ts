import { IAuctionRepository } from '../../../domain/entities/auction/repositories/auction.repository';
import { IBidRepository } from '../../../domain/entities/auction/repositories/bid.repository';
import { IOfferRepository } from '../../../domain/entities/offer/offer.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { IAuctionActivityRepository } from '../../../domain/entities/auction/repositories/activity.repository';
import { AuctionError } from '../../../domain/entities/auction/auction.errors';

export class RespondToOfferUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private offerRepository: IOfferRepository,
        private paymentRepository: IPaymentRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(
        offerId: string,
        userId: string,
        response: 'ACCEPT' | 'DECLINE'
    ): Promise<{ success: boolean; message: string }> {
        console.log(`📬 User ${userId} responding to offer ${offerId}: ${response}`);

        // 1. Get offer
        const offer = await this.offerRepository.findById(offerId);
        if (!offer) {
            throw new Error('Offer not found');
        }

        // 2. Check if user matches
        if (offer.userId !== userId) {
            throw new Error('Unauthorized');
        }

        // 3. Check if offer is pending
        if (offer.status !== 'PENDING') {
            throw new Error('Offer is no longer available');
        }

        // 4. Check if expired
        if (new Date() > offer.expiresAt) {
            await this.offerRepository.update(offerId, {
                status: 'EXPIRED',
                respondedAt: new Date()
            });
            throw new Error('Offer has expired');
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
                winnerId: userId,
                winnerPaymentDeadline: paymentDeadline,
                completionStatus: 'PENDING'
            });

            // 7. Create payment record
            await this.paymentRepository.create({
                auctionId: offer.auctionId,
                userId,
                amount: offer.bidAmount
            });

            // 8. Log activity
            await this.activityRepository.logActivity(
                offer.auctionId,
                'OFFER_ACCEPTED',
                `Offer accepted by ${userId}. New winner: ₹${offer.bidAmount}`,
                undefined
            );

            return { success: true, message: 'Offer accepted. You are now the winner!' };
        } else {
            // DECLINE: Offer to next bidder
            console.log(`❌ User ${userId} declined offer for auction ${offer.auctionId}`);

            // 5. Update offer
            await this.offerRepository.update(offerId, {
                status: 'DECLINED',
                respondedAt
            });

            // 6. Log activity
            await this.activityRepository.logActivity(
                offer.auctionId,
                'OFFER_DECLINED',
                `Offer declined by ${userId}`,
                undefined
            );

            // 7. Find next bidder
            const validBids = await this.bidRepository.findLatestValidByAuction(offer.auctionId, 1000);
            const auction = await this.auctionRepository.findById(offer.auctionId);

            // Get existing offers to know which ranks are taken
            const existingOffers = await this.offerRepository.findByAuctionId(offer.auctionId);
            const declinedRanks = existingOffers
                .filter(o => o.status === 'DECLINED' || o.status === 'EXPIRED')
                .map(o => o.offerRank);

            const sortedBids = validBids
                .filter((bid: any) => {
                    // Exclude original winner and users who already declined
                    const hasDeclinedOffer = existingOffers.some(
                        o => o.userId === bid.userId && (o.status === 'DECLINED' || o.status === 'EXPIRED')
                    );
                    return bid.userId !== auction?.winnerId && !hasDeclinedOffer;
                })
                .sort((a: any, b: any) => b.amount - a.amount);

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

                await this.activityRepository.logActivity(
                    offer.auctionId,
                    'OFFER_CREATED',
                    `Offer created for bidder rank ${nextRank}: ₹${nextBidder.amount}`,
                    nextBidder.userId
                );

                console.log(`📨 Offer created for next bidder: ${nextBidder.userId} (rank ${nextRank})`);
            } else {
                // All top 5 declined or no more bidders - mark auction as FAILED
                await this.auctionRepository.update(offer.auctionId, {
                    completionStatus: 'FAILED',
                    winnerId: null,
                    winnerPaymentDeadline: null
                });

                await this.activityRepository.logActivity(
                offer.auctionId,
                'AUCTION_FAILED',
                'All top bidders declined. Auction failed.',
                auction?.sellerId || ''
            );

                console.log(`❌ Auction ${offer.auctionId} marked as FAILED`);
            }

            return { success: true, message: 'Offer declined' };
        }
    }
}
