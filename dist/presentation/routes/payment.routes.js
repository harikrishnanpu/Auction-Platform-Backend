"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRoutes = createPaymentRoutes;
const express_1 = require("express");
function createPaymentRoutes(paymentController, authMiddleware) {
    const router = (0, express_1.Router)();
    router.post('/auctions/:id/payment/create-order', authMiddleware, paymentController.createOrder);
    router.post('/auctions/:id/payment/verify', authMiddleware, paymentController.verifyPayment);
    router.get('/users/me/pending-payments', authMiddleware, paymentController.getPendingPayments);
    return router;
}
