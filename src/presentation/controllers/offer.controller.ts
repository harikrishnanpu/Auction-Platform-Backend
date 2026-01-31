import { Request, Response } from 'express';
import { RespondToOfferUseCase } from '../../application/useCases/offer/respond-to-offer.usecase';
import { IOfferRepository } from '../../domain/offer/offer.repository';
import { IAuctionRepository } from '../../domain/auction/repositories/auction.repository';
import { HttpStatus } from '../../application/constants/http-status.constants';
import { ResponseMessages } from '../../application/constants/response.messages';

export class OfferController {
    constructor(
        private respondToOfferUseCase: RespondToOfferUseCase,
        private offerRepository: IOfferRepository,
        private auctionRepository: IAuctionRepository
    ) { }

    getPendingOffers = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ error: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const offers = await this.offerRepository.findPendingByUser(userId);

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

            res.status(HttpStatus.OK).json({
                success: true,
                data: offersWithAuction
            });
        } catch (error: any) {
            console.error('Error getting pending offers:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: ResponseMessages.FAILED_GET_PENDING_OFFERS
            });
        }
    };


    respondToOffer = async (req: Request, res: Response): Promise<void> => {
        try {
            const { offerId } = req.params;
            const userId = (req as any).user?.userId;
            const { response } = req.body;

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ error: ResponseMessages.UNAUTHORIZED });
                return;
            }

            if (response !== 'ACCEPT' && response !== 'DECLINE') {
                res.status(HttpStatus.BAD_REQUEST).json({ error: ResponseMessages.INVALID_OFFER_RESPONSE });
                return;
            }

            const result = await this.respondToOfferUseCase.execute(offerId, userId, response);

            res.status(HttpStatus.OK).json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            console.error('Error responding to offer:', error);
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                error: error.message || ResponseMessages.FAILED_RESPOND_OFFER
            });
        }
    };
}

