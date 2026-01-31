import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
    private razorpay: Razorpay;
    private keyId: string;
    private keySecret: string;

    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || '';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';

        if (!this.keyId || !this.keySecret) {
            console.warn('Razorpay credentials not configured');
        }

        this.razorpay = new Razorpay({
            key_id: this.keyId,
            key_secret: this.keySecret
        });

        console.log('Razorpay service initialized');
    }


    async createOrder(amount: number, auctionId: string, userId: string) {
        try {
            const order = await this.razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: `auction_${auctionId}_${Date.now()}`,
                notes: {
                    auctionId,
                    userId,
                    purpose: 'auction_payment'
                }
            });

            console.log(`Razorpay order created: ${order.id}, amount: ₹${amount}`);
            return order;
        } catch (error) {
            console.log('Failed to create Razorpay order:', error);
            throw new Error('Failed to create payment order');
        }
    }

    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        try {
            const body = orderId + "|" + paymentId;
            const expectedSignature = crypto
                .createHmac('sha256', this.keySecret)
                .update(body)
                .digest('hex');

            const isValid = expectedSignature === signature;

            if (isValid) {
                console.log(`Payment signature verified: ${paymentId}`);
            } else {
                console.error(`Invalid payment signature: ${paymentId}`);
            }

            return isValid;
        } catch (error) {
            console.error('Error verifying payment signature:', error);
            return false;
        }
    }

    async getPaymentDetails(paymentId: string) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            return payment;
        } catch (error) {
            console.error(`Failed to fetch payment details: ${paymentId}`, error);
            throw new Error('Failed to fetch payment details');
        }
    }

    async createRefund(paymentId: string, amount?: number) {
        try {
            const refund = await this.razorpay.payments.refund(paymentId, {
                amount: amount ? Math.round(amount * 100) : undefined
            });

            console.log(`Refund created: ${refund.id}, payment: ${paymentId}`);
            return refund;
        } catch (error) {
            console.error(`Failed to create refund for payment: ${paymentId}`, error);
            throw new Error('Failed to create refund');
        }
    }

    getKeyId(): string {
        return this.keyId;
    }
}

export const razorpayService = new RazorpayService();
