"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPaymentDI = setupPaymentDI;
// Repositories
const prisma_payment_repository_1 = require("../infrastructure/repositories/payment/prisma-payment.repository");
const prisma_offer_repository_1 = require("../infrastructure/repositories/offer/prisma-offer.repository");
const prisma_critical_user_repository_1 = require("../infrastructure/repositories/critical-user/prisma-critical-user.repository");
const prisma_auction_repository_1 = require("../infrastructure/repositories/auction/prisma-auction.repository");
const prisma_bid_repository_1 = require("../infrastructure/repositories/auction/prisma-bid.repository");
const prisma_activity_repository_1 = require("../infrastructure/repositories/auction/prisma-activity.repository");
// Use Cases
const end_auction_usecase_1 = require("../application/useCases/auction/end-auction.usecase");
const create_payment_order_usecase_1 = require("../application/useCases/payment/create-payment-order.usecase");
const verify_payment_usecase_1 = require("../application/useCases/payment/verify-payment.usecase");
const handle_payment_expiry_usecase_1 = require("../application/useCases/payment/handle-payment-expiry.usecase");
const respond_to_offer_usecase_1 = require("../application/useCases/offer/respond-to-offer.usecase");
const handle_offer_expiry_usecase_1 = require("../application/useCases/offer/handle-offer-expiry.usecase");
const mark_critical_usecase_1 = require("../application/useCases/critical-user/mark-critical.usecase");
// Controllers
const payment_controller_1 = require("../presentation/controllers/payment.controller");
const offer_controller_1 = require("../presentation/controllers/offer.controller");
// Cron
const auction_cron_service_1 = require("../infrastructure/cron/auction-cron.service");
function setupPaymentDI(prisma) {
    // Repositories
    const paymentRepository = new prisma_payment_repository_1.PrismaPaymentRepository(prisma);
    const offerRepository = new prisma_offer_repository_1.PrismaOfferRepository(prisma);
    const criticalUserRepository = new prisma_critical_user_repository_1.PrismaCriticalUserRepository(prisma);
    const auctionRepository = new prisma_auction_repository_1.PrismaAuctionRepository(prisma);
    const bidRepository = new prisma_bid_repository_1.PrismaBidRepository(prisma);
    const activityRepository = new prisma_activity_repository_1.PrismaAuctionActivityRepository(prisma);
    // Use Cases
    const endAuctionUseCase = new end_auction_usecase_1.EndAuctionUseCase(auctionRepository, bidRepository, activityRepository, paymentRepository);
    const createPaymentOrderUseCase = new create_payment_order_usecase_1.CreatePaymentOrderUseCase(auctionRepository, paymentRepository);
    const verifyPaymentUseCase = new verify_payment_usecase_1.VerifyPaymentUseCase(auctionRepository, paymentRepository, activityRepository);
    const handlePaymentExpiryUseCase = new handle_payment_expiry_usecase_1.HandlePaymentExpiryUseCase(auctionRepository, bidRepository, paymentRepository, offerRepository, criticalUserRepository, activityRepository);
    const respondToOfferUseCase = new respond_to_offer_usecase_1.RespondToOfferUseCase(auctionRepository, bidRepository, offerRepository, paymentRepository, activityRepository);
    const handleOfferExpiryUseCase = new handle_offer_expiry_usecase_1.HandleOfferExpiryUseCase(offerRepository, respondToOfferUseCase);
    const markCriticalUseCase = new mark_critical_usecase_1.MarkCriticalUseCase(criticalUserRepository);
    // Controllers
    const paymentController = new payment_controller_1.PaymentController(createPaymentOrderUseCase, verifyPaymentUseCase, paymentRepository, auctionRepository);
    const offerController = new offer_controller_1.OfferController(respondToOfferUseCase, offerRepository, auctionRepository);
    // Cron Service
    const auctionCronService = new auction_cron_service_1.AuctionCronService(prisma, endAuctionUseCase, handlePaymentExpiryUseCase, handleOfferExpiryUseCase);
    return {
        // Repositories
        paymentRepository,
        offerRepository,
        criticalUserRepository,
        // Use Cases
        endAuctionUseCase,
        createPaymentOrderUseCase,
        verifyPaymentUseCase,
        handlePaymentExpiryUseCase,
        respondToOfferUseCase,
        handleOfferExpiryUseCase,
        markCriticalUseCase,
        // Controllers
        paymentController,
        offerController,
        // Cron
        auctionCronService
    };
}
