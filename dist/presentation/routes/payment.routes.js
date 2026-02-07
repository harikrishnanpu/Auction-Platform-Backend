"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRoutes = createPaymentRoutes;
const express_1 = require("express");
function createPaymentRoutes(paymentController, authMiddleware) {
    const router = (0, express_1.Router)();
    // Create payment order
    router.post('/auctions/:id/payment/create-order', authMiddleware, paymentController.createOrder);
    // Verify payment
    router.post('/auctions/:id/payment/verify', authMiddleware, paymentController.verifyPayment);
    // Get pending payments
    router.get('/users/me/pending-payments', authMiddleware, paymentController.getPendingPayments);
    return router;
}
