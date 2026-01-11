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
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/v1/user/auth', routes_di_1.authRoutes.register());
app.use('/api/v1/admin/auth', routes_di_1.adminRoutes.register());
// Initialize Workers
const email_worker_1 = require("./infrastructure/workers/email.worker");
new email_worker_1.EmailWorker();
exports.default = app;
