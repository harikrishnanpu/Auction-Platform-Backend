import { Router } from 'express';
import { PaymentController } from '../controllers/other/payment.controller';

export function createPaymentRoutes(paymentController: PaymentController, authMiddleware: any): Router {
    const router = Router();

    // Create payment order
    router.post('/auctions/:id/payment/create-order', authMiddleware, paymentController.createOrder);

    // Verify payment
    router.post('/auctions/:id/payment/verify', authMiddleware, paymentController.verifyPayment);

    // Get pending payments
    router.get('/users/me/pending-payments', authMiddleware, paymentController.getPendingPayments);

    return router;
}
