"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPaymentUseCase = void 0;
class VerifyPaymentUseCase {
    constructor(auctionRepository, paymentRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.paymentRepository = paymentRepository;
        this.activityRepository = activityRepository;
    }
    async execute(paymentData) {
        return { success: true, message: 'Payment verified' };
    }
}
exports.VerifyPaymentUseCase = VerifyPaymentUseCase;
