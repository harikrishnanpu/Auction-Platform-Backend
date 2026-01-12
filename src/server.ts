import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes, adminRoutes, kycRoutes } from './Di/routes.di';
import { EmailWorker } from './infrastructure/workers/email.worker';
import { logger } from './infrastructure/logger/pino.logger';
import { requestLoggerMiddleware } from './presentation/middlewares/request-logger.middleware';

dotenv.config();

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'https://0626e2f0a09a.ngrok-free.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLoggerMiddleware(logger))

app.use('/api/v1/user/auth', authRoutes.register());
app.use('/api/v1/admin', adminRoutes.register());
app.use('/api/v1/kyc', kycRoutes.register());

new EmailWorker();

export default app;
