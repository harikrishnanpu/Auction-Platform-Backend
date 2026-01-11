import { PrismaUserRepository } from "../infrastructure/database/prisma/prisma-user.repository";
import { PrismaOTPRepository } from "../infrastructure/repositories/otp/prisma-otp.repository";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // We need prisma instance for OTP repo as I defined it to take prisma in constructor.

export const userRepository = new PrismaUserRepository(); // Keeping as is if it doesn't take args.
export const otpRepository = new PrismaOTPRepository(prisma);
