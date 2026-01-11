"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpRepository = exports.userRepository = void 0;
const prisma_user_repository_1 = require("../infrastructure/database/prisma/prisma-user.repository");
const prisma_otp_repository_1 = require("../infrastructure/repositories/otp/prisma-otp.repository");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient(); // We need prisma instance for OTP repo as I defined it to take prisma in constructor.
exports.userRepository = new prisma_user_repository_1.PrismaUserRepository(); // Keeping as is if it doesn't take args.
exports.otpRepository = new prisma_otp_repository_1.PrismaOTPRepository(prisma);
