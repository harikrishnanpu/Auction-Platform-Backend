"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlePaymentExpiryUseCase = void 0;
class HandlePaymentExpiryUseCase {
    constructor(auctionRepository, bidRepository, paymentRepository, offerRepository, criticalUserRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.paymentRepository = paymentRepository;
        this.offerRepository = offerRepository;
        this.criticalUserRepository = criticalUserRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId) {
        console.log('Checking for expired payments...');
    }
}
exports.HandlePaymentExpiryUseCase = HandlePaymentExpiryUseCase;
