import { PrismaUserRepository } from "../infrastructure/repositories/prisma-user.repository";
import { PrismaOTPRepository } from "../infrastructure/repositories/otp/prisma-otp.repository";
import { PrismaKYCRepository } from "../infrastructure/repositories/prisma-kyc.repository";
import prisma from "../utils/prismaClient";

import { PrismaAuctionRepository } from "../infrastructure/repositories/auction/prisma-auction.repository";

export const userRepository = new PrismaUserRepository();
export const otpRepository = new PrismaOTPRepository(prisma);
export const kycRepository = new PrismaKYCRepository();
export const auctionRepository = new PrismaAuctionRepository(prisma);
