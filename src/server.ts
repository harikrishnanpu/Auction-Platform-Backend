import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes, adminRoutes, kycRoutes, sellerRoutes, auctionRoutes } from './Di/routes.di';
import { EmailWorker } from './infrastructure/workers/email.worker';
import { logger } from './infrastructure/logger/pino.logger';
import { requestLoggerMiddleware } from './presentation/middlewares/request-logger.middleware';
import passport from 'passport';
import { configureGoogleStrategy } from './presentation/strategies/google.strategy';

import { errorMiddleware } from './presentation/middlewares/error.middleware';

dotenv.config();

const app = express();

const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://192.168.1.10:3000',
        'https://0626e2f0a09a.ngrok-free.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLoggerMiddleware(logger))
app.use(passport.initialize());
configureGoogleStrategy();

app.use('/api/v1/auth', authRoutes.register());
app.use('/api/v1/admin', adminRoutes.register());
app.use('/api/v1/kyc', kycRoutes.register());
app.use('/api/v1/seller', sellerRoutes.register());
app.use('/api/v1/auctions', auctionRoutes.register());

app.use(errorMiddleware);

new EmailWorker();

export default app;
