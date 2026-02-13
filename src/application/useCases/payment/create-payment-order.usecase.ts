import { IAuctionRepository } from '../../../domain/entities/auction/repositories/auction.repository';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { razorpayService } from '../../../infrastructure/services/razorpay/razorpay.service';
import { AuctionError } from '../../../domain/entities/auction/auction.errors';

export class CreatePaymentOrderUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private paymentRepository: IPaymentRepository
    ) { }

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
            throw new Error('Auction not found');
        }

        // 2. Check if auction is ended
        if (auction.status !== 'ENDED') {
            throw new Error('Auction is not ended yet');
        }

        // 3. Check if user is the winner
        if (auction.winnerId !== userId) {
            throw new Error('You are not the winner of this auction');
        }

        // 4. Check if payment already exists
        const existingPayments = await this.paymentRepository.findByAuctionId(auctionId);
        const pendingPayment = existingPayments.find(p => p.userId === userId && p.status === 'PENDING');

        if (!pendingPayment) {
            throw new Error('No pending payment found');
        }

        // 5. Check if payment deadline has passed
        if (auction.winnerPaymentDeadline && new Date() > auction.winnerPaymentDeadline) {
            throw new Error('Payment deadline has passed');
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
