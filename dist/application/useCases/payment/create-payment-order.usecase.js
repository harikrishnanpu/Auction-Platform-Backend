"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentOrderUseCase = void 0;
const razorpay_service_1 = require("../../../infrastructure/services/razorpay/razorpay.service");
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class CreatePaymentOrderUseCase {
    constructor(auctionRepository, paymentRepository) {
        this.auctionRepository = auctionRepository;
        this.paymentRepository = paymentRepository;
    }
    async execute(auctionId, userId) {
        console.log(`💳 Creating payment order for auction ${auctionId}, user ${userId}`);
        // 1. Get auction
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new auction_errors_1.AuctionError('Auction not found', 'NOT_FOUND');
        }
        // 2. Check if auction is ended
        if (auction.status !== 'ENDED') {
            throw new auction_errors_1.AuctionError('Auction is not ended yet', 'INVALID_STATUS');
        }
        // 3. Check if user is the winner
        if (auction.winner_id !== userId) {
            throw new auction_errors_1.AuctionError('You are not the winner of this auction', 'NOT_ALLOWED');
        }
        // 4. Check if payment already exists
        const existingPayments = await this.paymentRepository.findByAuctionId(auctionId);
        const pendingPayment = existingPayments.find(p => p.userId === userId && p.status === 'PENDING');
        if (!pendingPayment) {
            throw new auction_errors_1.AuctionError('No pending payment found', 'NOT_FOUND');
        }
        // 5. Check if payment deadline has passed
        if (auction.winner_payment_deadline && new Date() > auction.winner_payment_deadline) {
            throw new auction_errors_1.AuctionError('Payment deadline has passed', 'DEADLINE_EXPIRED');
        }
        // 6. Check if Razorpay order already created
        if (pendingPayment.razorpayOrderId) {
            console.log(`⚠️ Payment order already exists: ${pendingPayment.razorpayOrderId}`);
            return {
                orderId: pendingPayment.razorpayOrderId,
                amount: pendingPayment.amount,
                currency: 'INR',
                keyId: razorpay_service_1.razorpayService.getKeyId(),
                paymentId: pendingPayment.id
            };
        }
        // 7. Create Razorpay order
        const order = await razorpay_service_1.razorpayService.createOrder(pendingPayment.amount, auctionId, userId);
        // 8. Update payment with order ID
        await this.paymentRepository.update(pendingPayment.id, {
            razorpayOrderId: order.id
        });
        console.log(`✅ Payment order created: ${order.id}`);
        return {
            orderId: order.id,
            amount: pendingPayment.amount,
            currency: 'INR',
            keyId: razorpay_service_1.razorpayService.getKeyId(),
            paymentId: pendingPayment.id
        };
    }
}
exports.CreatePaymentOrderUseCase = CreatePaymentOrderUseCase;
