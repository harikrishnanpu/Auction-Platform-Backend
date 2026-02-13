"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferController = void 0;
class OfferController {
    constructor(respondToOfferUseCase, offerRepository, auctionRepository) {
        this.respondToOfferUseCase = respondToOfferUseCase;
        this.offerRepository = offerRepository;
        this.auctionRepository = auctionRepository;
        /**
         * GET /api/v1/users/me/pending-offers
         * Get user's pending offers
         */
        this.getPendingOffers = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const offers = await this.offerRepository.findPendingByUser(userId);
                // Get auction details for each offer
                const offersWithAuction = await Promise.all(offers.map(async (offer) => {
                    const auction = await this.auctionRepository.findById(offer.auctionId);
                    return {
                        ...offer,
                        auction: auction ? {
                            id: auction.id,
                            title: auction.title,
                            endAt: auction.endAt
                        } : null
                    };
                }));
                res.status(200).json({
                    success: true,
                    data: offersWithAuction
                });
            }
            catch (error) {
                console.error('Error getting pending offers:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get pending offers'
                });
            }
        };
        /**
         * POST /api/v1/auctions/:auctionId/offers/:offerId/respond
         * Respond to an offer (accept or decline)
         */
        this.respondToOffer = async (req, res) => {
            try {
                const { offerId } = req.params;
                const userId = req.user?.userId;
                const { response } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                if (response !== 'ACCEPT' && response !== 'DECLINE') {
                    res.status(400).json({ error: 'Invalid response. Must be ACCEPT or DECLINE' });
                    return;
                }
                const result = await this.respondToOfferUseCase.execute(offerId, userId, response);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error responding to offer:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Failed to respond to offer'
                });
            }
        };
    }
}
exports.OfferController = OfferController;
