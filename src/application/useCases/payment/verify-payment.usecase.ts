import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { IAuctionActivityRepository } from '../../../domain/auction/repositories/activity.repository';

export class VerifyPaymentUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private paymentRepository: IPaymentRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(paymentData: any): Promise<{ success: boolean; message: string }> {
        return { success: true, message: 'Payment verified' };
    }
}
