"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_di_1 = require("./Di/routes.di");
const email_worker_1 = require("./infrastructure/workers/email.worker");
const pino_logger_1 = require("./infrastructure/logger/pino.logger");
const request_logger_middleware_1 = require("./presentation/http/middlewares/request-logger.middleware");
const passport_1 = __importDefault(require("passport"));
const google_strategy_1 = require("./presentation/strategies/google.strategy");
const error_middleware_1 = require("./presentation/http/middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, request_logger_middleware_1.requestLoggerMiddleware)(pino_logger_1.logger));
app.use(passport_1.default.initialize());
(0, google_strategy_1.configureGoogleStrategy)();
app.use('/api/v1/auth', routes_di_1.authRoutes.register());
app.use('/api/v1/admin', routes_di_1.adminRoutes.register());
app.use('/api/v1/kyc', routes_di_1.kycRoutes.register());
app.use('/api/v1/seller', routes_di_1.sellerRoutes.register());
app.use('/api/v1/auctions', routes_di_1.auctionRoutes.register());
app.use(error_middleware_1.errorMiddleware);
new email_worker_1.EmailWorker();
exports.default = app;
