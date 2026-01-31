"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespondToOfferUseCase = void 0;
class RespondToOfferUseCase {
    constructor(auctionRepository, bidRepository, offerRepository, paymentRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.offerRepository = offerRepository;
        this.paymentRepository = paymentRepository;
        this.activityRepository = activityRepository;
    }
    async execute(offerId, userId, response) {
        const offer = await this.offerRepository.findById(offerId);
        if (!offer) {
            throw new Error('Offer not found');
        }
        if (offer.userId !== userId) {
        }
        if (offer.status !== 'PENDING') {
            throw new Error('Offer is not pending');
        }
        if (response === 'ACCEPT') {
            await this.offerRepository.update(offerId, { status: 'ACCEPTED' });
        }
        else {
            await this.offerRepository.update(offerId, { status: 'DECLINED' });
        }
        return { success: true, message: `Offer ${response.toLowerCase()}ed successfully` };
    }
}
exports.RespondToOfferUseCase = RespondToOfferUseCase;
