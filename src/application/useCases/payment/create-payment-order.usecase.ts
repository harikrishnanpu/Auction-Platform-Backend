import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { razorpayService } from '../../../infrastructure/services/razorpay/razorpay.service';
import { AuctionError } from '../../../domain/auction/auction.errors';

export class CreatePaymentOrderUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private paymentRepository: IPaymentRepository
    ) {}

    async execute(auctionId: string, userId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        paymentId: string;
    }> {
        console.log(`💳 Creating payment order for auction ${auctionId}, user ${userId}`);

        // 1. Get auction
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError('Auction not found', 'NOT_FOUND');
        }

        // 2. Check if auction is ended
        if (auction.status !== 'ENDED') {
            throw new AuctionError('Auction is not ended yet', 'INVALID_STATUS');
        }

        // 3. Check if user is the winner
        if (auction.winner_id !== userId) {
            throw new AuctionError('You are not the winner of this auction', 'NOT_ALLOWED');
        }

        // 4. Check if payment already exists
        const existingPayments = await this.paymentRepository.findByAuctionId(auctionId);
        const pendingPayment = existingPayments.find(p => p.userId === userId && p.status === 'PENDING');

        if (!pendingPayment) {
            throw new AuctionError('No pending payment found', 'NOT_FOUND');
        }

        // 5. Check if payment deadline has passed
        if (auction.winner_payment_deadline && new Date() > auction.winner_payment_deadline) {
            throw new AuctionError('Payment deadline has passed', 'DEADLINE_EXPIRED');
        }

        // 6. Check if Razorpay order already created
        if (pendingPayment.razorpayOrderId) {
            console.log(`⚠️ Payment order already exists: ${pendingPayment.razorpayOrderId}`);
            return {
                orderId: pendingPayment.razorpayOrderId,
                amount: pendingPayment.amount,
                currency: 'INR',
                keyId: razorpayService.getKeyId(),
                paymentId: pendingPayment.id
            };
        }

        // 7. Create Razorpay order
        const order = await razorpayService.createOrder(
            pendingPayment.amount,
            auctionId,
            userId
        );

        // 8. Update payment with order ID
        await this.paymentRepository.update(pendingPayment.id, {
            razorpayOrderId: order.id
        });

        console.log(`✅ Payment order created: ${order.id}`);

        return {
            orderId: order.id,
            amount: pendingPayment.amount,
            currency: 'INR',
            keyId: razorpayService.getKeyId(),
            paymentId: pendingPayment.id
        };
    }
}
