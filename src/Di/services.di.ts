import { JwtServiceImpl } from "../infrastructure/security/jwt.service";
import { AdminJwtServiceImpl } from "../infrastructure/security/admin-jwt.service";
import { BcryptPasswordHasher } from "../infrastructure/security/password-hasher";
import { NodemailerEmailService } from "../infrastructure/services/email/nodemailer-email.service";
import { S3StorageService } from "../infrastructure/services/storage/s3-storage.service";

export const passwordHasher = new BcryptPasswordHasher();
export const jwtService = new JwtServiceImpl();
export const adminJwtService = new AdminJwtServiceImpl();
export const emailService = new NodemailerEmailService();
export const storageService = new S3StorageService();