import { BcryptPasswordHasher } from "../infrastructure/utils/password-hasher";
import { NodemailerEmailService } from "../infrastructure/services/email/nodemailer-email.service";
import { S3StorageService } from "../infrastructure/services/storage/s3-storage.service";
import { logger, PinoLogger } from "../infrastructure/logger/pino.logger";
import { OtpService } from "../infrastructure/utils/otp-generator";
import { TokenService } from "../infrastructure/services/jwt/jwt.service";
import { ResetTokenService } from "../infrastructure/services/token/reset-token.service";


export const passwordHasher = new BcryptPasswordHasher();
export const tokenService = new TokenService();
export const emailService = new NodemailerEmailService();
export const storageService = new S3StorageService();
export const loggerService = new PinoLogger(logger);
export const tokenGeneratorService = new ResetTokenService();
export const otpService = new OtpService();