import { PrismaUserRepository } from "../infrastructure/repositories/prisma-user.repository";
import { PrismaOTPRepository } from "../infrastructure/repositories/otp/prisma-otp.repository";
import prisma from "../utils/prismaClient";

export const userRepository = new PrismaUserRepository();
export const otpRepository = new PrismaOTPRepository(prisma);
