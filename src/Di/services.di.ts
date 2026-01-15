import { JwtServiceImpl } from "../infrastructure/utils/jwt.service";
import { AdminJwtServiceImpl } from "../infrastructure/utils/admin-jwt.service";
import { BcryptPasswordHasher } from "../infrastructure/utils/password-hasher";
import { NodemailerEmailService } from "../infrastructure/services/email/nodemailer-email.service";
import { S3StorageService } from "../infrastructure/services/storage/s3-storage.service";
import { logger, PinoLogger } from "../infrastructure/logger/pino.logger";
import { TokenGenerator } from "../infrastructure/utils/token-generator";
import { OtpService } from "../infrastructure/utils/otp-generator";

export const passwordHasher = new BcryptPasswordHasher();
export const jwtService = new JwtServiceImpl();
export const adminJwtService = new AdminJwtServiceImpl();
export const emailService = new NodemailerEmailService();
export const storageService = new S3StorageService();
export const loggerService = new PinoLogger(logger);
export const tokenGeneratorService = new TokenGenerator();
export const otpService = new OtpService();