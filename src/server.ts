import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes, adminRoutes } from './Di/routes.di';

dotenv.config();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/user/auth', authRoutes.register());
app.use('/api/v1/admin/auth', adminRoutes.register());

import { EmailWorker } from './infrastructure/workers/email.worker';
new EmailWorker();

export default app;
