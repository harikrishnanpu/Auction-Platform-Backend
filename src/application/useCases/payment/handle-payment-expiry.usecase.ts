import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { IBidRepository } from '../../../domain/auction/repositories/bid.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { IOfferRepository } from '../../../domain/offer/offer.repository';
import { ICriticalUserRepository } from '../../../domain/critical-user/critical-user.repository';
import { IAuctionActivityRepository } from '../../../domain/auction/repositories/activity.repository';

export class HandlePaymentExpiryUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private paymentRepository: IPaymentRepository,
        private offerRepository: IOfferRepository,
        private criticalUserRepository: ICriticalUserRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string): Promise<void> {
        console.log('Checking for expired payments...');
    }
}
