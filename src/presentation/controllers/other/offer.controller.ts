import { Request, Response } from 'express';
import { RespondToOfferUseCase } from '../../../application/useCases/offer/respond-to-offer.usecase';
import { IOfferRepository } from '../../../domain/offer/offer.repository';
import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';

export class OfferController {
    constructor(
        private respondToOfferUseCase: RespondToOfferUseCase,
        private offerRepository: IOfferRepository,
        private auctionRepository: IAuctionRepository
    ) { }

    /**
     * GET /api/v1/users/me/pending-offers
     * Get user's pending offers
     */
    getPendingOffers = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const offers = await this.offerRepository.findPendingByUser(userId);

            // Get auction details for each offer
            const offersWithAuction = await Promise.all(
                offers.map(async (offer) => {
                    const auction = await this.auctionRepository.findById(offer.auctionId);
                    return {
                        ...offer,
                        auction: auction ? {
                            id: auction.id,
                            title: auction.title,
                            endAt: auction.endAt
                        } : null
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: offersWithAuction
            });
        } catch (error: any) {
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
    respondToOffer = async (req: Request, res: Response): Promise<void> => {
        try {
            const { offerId } = req.params;
            const userId = (req as any).user?.userId;
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
        } catch (error: any) {
            console.error('Error responding to offer:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to respond to offer'
            });
        }
    };
}
