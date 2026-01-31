"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferController = void 0;
const http_status_constants_1 = require("../../application/constants/http-status.constants");
const response_messages_1 = require("../../application/constants/response.messages");
class OfferController {
    constructor(respondToOfferUseCase, offerRepository, auctionRepository) {
        this.respondToOfferUseCase = respondToOfferUseCase;
        this.offerRepository = offerRepository;
        this.auctionRepository = auctionRepository;
        this.getPendingOffers = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ error: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const offers = await this.offerRepository.findPendingByUser(userId);
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
                res.status(http_status_constants_1.HttpStatus.OK).json({
                    success: true,
                    data: offersWithAuction
                });
            }
            catch (error) {
                console.error('Error getting pending offers:', error);
                res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    error: response_messages_1.ResponseMessages.FAILED_GET_PENDING_OFFERS
                });
            }
        };
        this.respondToOffer = async (req, res) => {
            try {
                const { offerId } = req.params;
                const userId = req.user?.userId;
                const { response } = req.body;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ error: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                if (response !== 'ACCEPT' && response !== 'DECLINE') {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ error: response_messages_1.ResponseMessages.INVALID_OFFER_RESPONSE });
                    return;
                }
                const result = await this.respondToOfferUseCase.execute(offerId, userId, response);
                res.status(http_status_constants_1.HttpStatus.OK).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error responding to offer:', error);
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: error.message || response_messages_1.ResponseMessages.FAILED_RESPOND_OFFER
                });
            }
        };
    }
}
exports.OfferController = OfferController;
