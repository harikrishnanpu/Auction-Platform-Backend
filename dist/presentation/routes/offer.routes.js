"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOfferRoutes = createOfferRoutes;
const express_1 = require("express");
function createOfferRoutes(offerController, authMiddleware) {
    const router = (0, express_1.Router)();
    router.get('/users/me/pending-offers', authMiddleware, offerController.getPendingOffers);
    router.post('/auctions/:auctionId/offers/:offerId/respond', authMiddleware, offerController.respondToOffer);
    return router;
}
