"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOfferRoutes = createOfferRoutes;
const express_1 = require("express");
function createOfferRoutes(offerController, authMiddleware) {
    const router = (0, express_1.Router)();
    // Get pending offers
    router.get('/users/me/pending-offers', authMiddleware, offerController.getPendingOffers);
    // Respond to offer
    router.post('/auctions/:auctionId/offers/:offerId/respond', authMiddleware, offerController.respondToOffer);
    return router;
}
