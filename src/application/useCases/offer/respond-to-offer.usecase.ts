import { IOfferRepository } from '../../../domain/offer/offer.repository';
import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { IBidRepository } from '../../../domain/auction/repositories/bid.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { IAuctionActivityRepository } from '../../../domain/auction/repositories/activity.repository';

export class RespondToOfferUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private offerRepository: IOfferRepository,
        private paymentRepository: IPaymentRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(offerId: string, userId: string, response: 'ACCEPT' | 'DECLINE'): Promise<{ success: boolean; message: string }> {
        const offer = await this.offerRepository.findById(offerId);

        if (!offer) {
            throw new Error('Offer not found');
        }

        if (offer.userId !== userId) {
        }

        if (offer.status !== 'PENDING') {
            throw new Error('Offer is not pending');
        }

        if (response === 'ACCEPT') {
            await this.offerRepository.update(offerId, { status: 'ACCEPTED' });
        } else {
            await this.offerRepository.update(offerId, { status: 'DECLINED' });
        }

        return { success: true, message: `Offer ${response.toLowerCase()}ed successfully` };
    }
}
