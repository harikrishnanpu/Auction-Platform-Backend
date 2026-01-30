import { Router } from 'express';
import { OfferController } from '../controllers/offer.controller';

export function createOfferRoutes(offerController: OfferController, authMiddleware: any): Router {
    const router = Router();

    // Get pending offers
    router.get('/users/me/pending-offers', authMiddleware, offerController.getPendingOffers);

    // Respond to offer
    router.post('/auctions/:auctionId/offers/:offerId/respond', authMiddleware, offerController.respondToOffer);

    return router;
}
