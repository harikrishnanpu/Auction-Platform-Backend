"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPaymentUseCase = void 0;
const razorpay_service_1 = require("../../../infrastructure/services/razorpay/razorpay.service");
class VerifyPaymentUseCase {
    constructor(auctionRepository, paymentRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.paymentRepository = paymentRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        console.log(`🔐 Verifying payment for auction ${auctionId}`);
        // 1. Get payment by order ID
        const payment = await this.paymentRepository.findByOrderId(razorpayOrderId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        // 2. Check if user matches
        if (payment.userId !== userId) {
            throw new Error('Unauthorized payment verification');
        }
        // 3. Check if already verified
        if (payment.status === 'SUCCESS') {
            console.log(`⚠️ Payment already verified: ${payment.id}`);
            return { success: true, message: 'Payment already verified' };
        }
        // 4. Verify signature
        const isValid = razorpay_service_1.razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) {
            console.error(`❌ Invalid payment signature for payment ${payment.id}`);
            await this.paymentRepository.update(payment.id, {
                status: 'FAILED',
                failureReason: 'Invalid signature'
            });
            throw new Error('Payment verification failed');
        }
        // 5. Get payment details from Razorpay
        const paymentDetails = await razorpay_service_1.razorpayService.getPaymentDetails(razorpayPaymentId);
        // 6. Update payment as SUCCESS
        await this.paymentRepository.update(payment.id, {
            razorpayPaymentId,
            razorpaySignature,
            status: 'SUCCESS',
            paymentMethod: paymentDetails.method || undefined
        });
        // 7. Update auction completion status
        await this.auctionRepository.update(auctionId, {
            completionStatus: 'PAID'
        });
        // 8. Log activity
        await this.activityRepository.logActivity(auctionId, 'PAYMENT_SUCCESS', `Payment completed: ₹${payment.amount}`, userId);
        console.log(`✅ Payment verified successfully for auction ${auctionId}`);
        return { success: true, message: 'Payment successful' };
    }
}
exports.VerifyPaymentUseCase = VerifyPaymentUseCase;
