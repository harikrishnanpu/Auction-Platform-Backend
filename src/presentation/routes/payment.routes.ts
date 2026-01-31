import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

export function createPaymentRoutes(paymentController: PaymentController, authMiddleware: any): Router {
    const router = Router();
    router.post('/auctions/:id/payment/create-order', authMiddleware, paymentController.createOrder);
    router.post('/auctions/:id/payment/verify', authMiddleware, paymentController.verifyPayment);
    router.get('/users/me/pending-payments', authMiddleware, paymentController.getPendingPayments);

    return router;
}
