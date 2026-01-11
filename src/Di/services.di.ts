import { JwtServiceImpl } from "../infrastructure/security/jwt.service";
import { BcryptPasswordHasher } from "../infrastructure/security/password-hasher";
import { NodemailerEmailService } from "../infrastructure/services/email/nodemailer-email.service";

export const passwordHasher = new BcryptPasswordHasher();
export const jwtService = new JwtServiceImpl();
export const emailService = new NodemailerEmailService();