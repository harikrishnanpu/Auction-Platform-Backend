"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentOrderUseCase = void 0;
// import { RazorpayService } from '../../../infrastructure/services/razorpay.service'; // Assuming this exists or similar
class CreatePaymentOrderUseCase {
    constructor(auctionRepository, paymentRepository) {
        this.auctionRepository = auctionRepository;
        this.paymentRepository = paymentRepository;
    }
    async execute(auctionId, userId, amount) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction)
            throw new Error('Auction not found');
        return {
            id: 'order_' + Math.random().toString(36).substr(2, 9),
            entity: 'order',
            amount: amount * 100,
            amount_paid: 0,
            amount_due: amount * 100,
            currency: 'INR',
            receipt: `receipt_${auctionId}_${userId}`,
            status: 'created',
            attempts: 0,
            created_at: Math.floor(Date.now() / 1000),
        };
    }
}
exports.CreatePaymentOrderUseCase = CreatePaymentOrderUseCase;
