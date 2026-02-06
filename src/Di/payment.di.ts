import { PrismaClient } from '@prisma/client';

// Repositories
import { PrismaPaymentRepository } from '../infrastructure/repositories/payment/prisma-payment.repository';
import { PrismaOfferRepository } from '../infrastructure/repositories/offer/prisma-offer.repository';
import { PrismaCriticalUserRepository } from '../infrastructure/repositories/critical-user/prisma-critical-user.repository';
import { PrismaAuctionRepository } from '../infrastructure/repositories/auction/prisma-auction.repository';
import { PrismaBidRepository } from '../infrastructure/repositories/auction/prisma-bid.repository';
import { PrismaAuctionActivityRepository } from '../infrastructure/repositories/auction/prisma-activity.repository';

// Use Cases
import { EndAuctionUseCase } from '../application/useCases/auction/end-auction.usecase';
import { CreatePaymentOrderUseCase } from '../application/useCases/payment/create-payment-order.usecase';
import { VerifyPaymentUseCase } from '../application/useCases/payment/verify-payment.usecase';
import { HandlePaymentExpiryUseCase } from '../application/useCases/payment/handle-payment-expiry.usecase';
import { RespondToOfferUseCase } from '../application/useCases/offer/respond-to-offer.usecase';
import { HandleOfferExpiryUseCase } from '../application/useCases/offer/handle-offer-expiry.usecase';
import { MarkCriticalUseCase } from '../application/useCases/critical-user/mark-critical.usecase';

// Controllers
import { PaymentController } from '../presentation/controllers/other/payment.controller';
import { OfferController } from '../presentation/controllers/other/offer.controller';

// Cron
import { AuctionCronService } from '../infrastructure/cron/auction-cron.service';

export function setupPaymentDI(prisma: PrismaClient) {
    // Repositories
    const paymentRepository = new PrismaPaymentRepository(prisma);
    const offerRepository = new PrismaOfferRepository(prisma);
    const criticalUserRepository = new PrismaCriticalUserRepository(prisma);
    const auctionRepository = new PrismaAuctionRepository(prisma);
    const bidRepository = new PrismaBidRepository(prisma);
    const activityRepository = new PrismaAuctionActivityRepository(prisma);

    // Use Cases
    const endAuctionUseCase = new EndAuctionUseCase(
        auctionRepository,
        bidRepository,
        activityRepository,
        paymentRepository
    );

    const createPaymentOrderUseCase = new CreatePaymentOrderUseCase(
        auctionRepository,
        paymentRepository
    );

    const verifyPaymentUseCase = new VerifyPaymentUseCase(
        auctionRepository,
        paymentRepository,
        activityRepository
    );

    const handlePaymentExpiryUseCase = new HandlePaymentExpiryUseCase(
        auctionRepository,
        bidRepository,
        paymentRepository,
        offerRepository,
        criticalUserRepository,
        activityRepository
    );

    const respondToOfferUseCase = new RespondToOfferUseCase(
        auctionRepository,
        bidRepository,
        offerRepository,
        paymentRepository,
        activityRepository
    );

    const handleOfferExpiryUseCase = new HandleOfferExpiryUseCase(
        offerRepository,
        respondToOfferUseCase
    );

    const markCriticalUseCase = new MarkCriticalUseCase(criticalUserRepository);

    // Controllers
    const paymentController = new PaymentController(
        createPaymentOrderUseCase,
        verifyPaymentUseCase,
        paymentRepository,
        auctionRepository
    );

    const offerController = new OfferController(
        respondToOfferUseCase,
        offerRepository,
        auctionRepository
    );

    // Cron Service
    const auctionCronService = new AuctionCronService(
        prisma,
        endAuctionUseCase,
        handlePaymentExpiryUseCase,
        handleOfferExpiryUseCase
    );

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
