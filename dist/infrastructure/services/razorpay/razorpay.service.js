"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayService = exports.RazorpayService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
class RazorpayService {
    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || '';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        if (!this.keyId || !this.keySecret) {
            console.warn('⚠️ Razorpay credentials not configured');
        }
        this.razorpay = new razorpay_1.default({
            key_id: this.keyId,
            key_secret: this.keySecret
        });
        console.log('✅ Razorpay service initialized');
    }
    /**
     * Create a Razorpay order
     */
    async createOrder(amount, auctionId, userId) {
        try {
            const order = await this.razorpay.orders.create({
                amount: Math.round(amount * 100), // Convert to paise
                currency: 'INR',
                receipt: `auction_${auctionId}_${Date.now()}`,
                notes: {
                    auctionId,
                    userId,
                    purpose: 'auction_payment'
                }
            });
            console.log(`✅ Razorpay order created: ${order.id}, amount: ₹${amount}`);
            return order;
        }
        catch (error) {
            console.error('❌ Failed to create Razorpay order:', error);
            throw new Error('Failed to create payment order');
        }
    }
    /**
     * Verify Razorpay payment signature
     */
    verifyPaymentSignature(orderId, paymentId, signature) {
        try {
            const body = orderId + "|" + paymentId;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.keySecret)
                .update(body)
                .digest('hex');
            const isValid = expectedSignature === signature;
            if (isValid) {
                console.log(`✅ Payment signature verified: ${paymentId}`);
            }
            else {
                console.error(`❌ Invalid payment signature: ${paymentId}`);
            }
            return isValid;
        }
        catch (error) {
            console.error('❌ Error verifying payment signature:', error);
            return false;
        }
    }
    /**
     * Fetch payment details from Razorpay
     */
    async getPaymentDetails(paymentId) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            return payment;
        }
        catch (error) {
            console.error(`❌ Failed to fetch payment details: ${paymentId}`, error);
            throw new Error('Failed to fetch payment details');
        }
    }
    /**
     * Create refund for a payment
     */
    async createRefund(paymentId, amount) {
        try {
            const refund = await this.razorpay.payments.refund(paymentId, {
                amount: amount ? Math.round(amount * 100) : undefined
            });
            console.log(`✅ Refund created: ${refund.id}, payment: ${paymentId}`);
            return refund;
        }
        catch (error) {
            console.error(`❌ Failed to create refund for payment: ${paymentId}`, error);
            throw new Error('Failed to create refund');
        }
    }
    /**
     * Get Razorpay key ID for frontend
     */
    getKeyId() {
        return this.keyId;
    }
}
exports.RazorpayService = RazorpayService;
exports.razorpayService = new RazorpayService();
