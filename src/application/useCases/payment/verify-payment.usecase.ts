import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { IActivityRepository } from '../../../domain/auction/repositories/activity.repository';
import { razorpayService } from '../../../infrastructure/services/razorpay/razorpay.service';
import { AuctionError } from '../../../domain/auction/auction.errors';

export class VerifyPaymentUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private paymentRepository: IPaymentRepository,
        private activityRepository: IActivityRepository
    ) {}

    async execute(
        auctionId: string,
        userId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ): Promise<{ success: boolean; message: string }> {
        console.log(`🔐 Verifying payment for auction ${auctionId}`);

        // 1. Get payment by order ID
        const payment = await this.paymentRepository.findByOrderId(razorpayOrderId);
        if (!payment) {
            throw new AuctionError('Payment not found', 'NOT_FOUND');
        }

        // 2. Check if user matches
        if (payment.userId !== userId) {
            throw new AuctionError('Unauthorized payment verification', 'NOT_ALLOWED');
        }

        // 3. Check if already verified
        if (payment.status === 'SUCCESS') {
            console.log(`⚠️ Payment already verified: ${payment.id}`);
            return { success: true, message: 'Payment already verified' };
        }

        // 4. Verify signature
        const isValid = razorpayService.verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            console.error(`❌ Invalid payment signature for payment ${payment.id}`);
            
            await this.paymentRepository.update(payment.id, {
                status: 'FAILED',
                failureReason: 'Invalid signature'
            });

            throw new AuctionError('Payment verification failed', 'PAYMENT_FAILED');
        }

        // 5. Get payment details from Razorpay
        const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);

        // 6. Update payment as SUCCESS
        await this.paymentRepository.update(payment.id, {
            razorpayPaymentId,
            razorpaySignature,
            status: 'SUCCESS',
            paymentMethod: paymentDetails.method || null
        });

        // 7. Update auction completion status
        await this.auctionRepository.update(auctionId, {
            completion_status: 'PAID'
        });

        // 8. Log activity
        await this.activityRepository.create({
            auctionId,
            userId,
            type: 'PAYMENT_SUCCESS',
            description: `Payment completed: ₹${payment.amount}`
        });

        console.log(`✅ Payment verified successfully for auction ${auctionId}`);

        return { success: true, message: 'Payment successful' };
    }
}
