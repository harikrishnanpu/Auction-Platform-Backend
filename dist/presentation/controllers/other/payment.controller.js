"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
class PaymentController {
    constructor(createPaymentOrderUseCase, verifyPaymentUseCase, paymentRepository, auctionRepository) {
        this.createPaymentOrderUseCase = createPaymentOrderUseCase;
        this.verifyPaymentUseCase = verifyPaymentUseCase;
        this.paymentRepository = paymentRepository;
        this.auctionRepository = auctionRepository;
        /**
         * POST /api/v1/auctions/:id/payment/create-order
         * Create Razorpay order for payment
         */
        this.createOrder = async (req, res) => {
            try {
                const auctionId = req.params.id;
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const result = await this.createPaymentOrderUseCase.execute(auctionId, userId);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                console.error('Error creating payment order:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Failed to create payment order'
                });
            }
        };
        /**
         * POST /api/v1/auctions/:id/payment/verify
         * Verify Razorpay payment
         */
        this.verifyPayment = async (req, res) => {
            try {
                const auctionId = req.params.id;
                const userId = req.user?.userId;
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                    res.status(400).json({ error: 'Missing payment details' });
                    return;
                }
                const result = await this.verifyPaymentUseCase.execute(auctionId, userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error verifying payment:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Payment verification failed'
                });
            }
        };
        /**
         * GET /api/v1/users/me/pending-payments
         * Get user's pending payments
         */
        this.getPendingPayments = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const payments = await this.paymentRepository.findPendingByUser(userId);
                // Get auction details for each payment
                const paymentsWithAuction = await Promise.all(payments.map(async (payment) => {
                    const auction = await this.auctionRepository.findById(payment.auctionId);
                    return {
                        ...payment,
                        auction: auction ? {
                            id: auction.id,
                            title: auction.title,
                            endAt: auction.endAt,
                            winnerPaymentDeadline: auction.winner_payment_deadline
                        } : null
                    };
                }));
                res.status(200).json({
                    success: true,
                    data: paymentsWithAuction
                });
            }
            catch (error) {
                console.error('Error getting pending payments:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get pending payments'
                });
            }
        };
    }
}
exports.PaymentController = PaymentController;
