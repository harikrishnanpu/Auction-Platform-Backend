import { PrismaUserRepository } from "../infrastructure/repositories/user/prisma-user.repository";
import { PrismaOTPRepository } from "../infrastructure/repositories/otp/prisma-otp.repository";
import { PrismaKYCRepository } from "../infrastructure/repositories/prisma-kyc.repository";
import prisma from "../utils/prismaClient";

import { PrismaAuctionRepository } from "../infrastructure/repositories/auction/prisma-auction.repository";
import { PrismaBidRepository } from "../infrastructure/repositories/auction/prisma-bid.repository";
import { PrismaChatMessageRepository } from "../infrastructure/repositories/auction/prisma-chat-message.repository";
import { PrismaAuctionParticipantRepository } from "../infrastructure/repositories/auction/prisma-auction-participant.repository";
import { PrismaAuctionCategoryRepository } from "../infrastructure/repositories/auction/prisma-auction-category.repository";
import { PrismaAuctionConditionRepository } from "../infrastructure/repositories/auction/prisma-auction-condition.repository";
import { PrismaAuctionActivityRepository } from "../infrastructure/repositories/auction/prisma-activity.repository";
import { PrismaTransactionManager } from "../infrastructure/database/prisma/prisma-transaction.manager";
import { PrismaPaymentRepository } from "../infrastructure/repositories/payment/prisma-payment.repository";

export const userRepository = new PrismaUserRepository();
export const otpRepository = new PrismaOTPRepository(prisma);
export const kycRepository = new PrismaKYCRepository();
export const auctionRepository = new PrismaAuctionRepository(prisma);
export const bidRepository = new PrismaBidRepository(prisma);
export const chatMessageRepository = new PrismaChatMessageRepository(prisma);
export const participantRepository = new PrismaAuctionParticipantRepository(prisma);
export const activityRepository = new PrismaAuctionActivityRepository(prisma);
export const categoryRepository = new PrismaAuctionCategoryRepository(prisma);
export const conditionRepository = new PrismaAuctionConditionRepository(prisma);
export const transactionManager = new PrismaTransactionManager(prisma);
export const paymentRepository = new PrismaPaymentRepository(prisma);
