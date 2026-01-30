import { logger } from './infrastructure/logger/pino.logger';
import app from './server';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initAuctionSocket } from './presentation/sockets/auction.socket';
import { setupPaymentDI } from './Di/payment.di';
import prisma from './utils/prismaClient';
import { createPaymentRoutes } from './presentation/routes/payment.routes';
import { createOfferRoutes } from './presentation/routes/offer.routes';
import { authenticate } from './presentation/middlewares/authenticate.middleware';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        // TODO: Fix payment integration errors before enabling
        // Setup payment DI
        // const paymentDI = setupPaymentDI(prisma);

        // Register payment and offer routes
        // app.use('/api/v1', createPaymentRoutes(paymentDI.paymentController, authenticate));
        // app.use('/api/v1', createOfferRoutes(paymentDI.offerController, authenticate));

        // logger.info('✅ Payment and offer routes registered');

        // Start cron jobs
        // paymentDI.auctionCronService.start();

        const httpServer = createServer(app);
        initAuctionSocket(httpServer);

        httpServer.listen(PORT, () => {
            logger.info(`Server started on ${PORT}`);
        });
    } catch (err) {
        logger.error('Server error:' + err);
    }
};

startServer();
