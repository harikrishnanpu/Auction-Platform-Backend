"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.jwtService = exports.passwordHasher = void 0;
const jwt_service_1 = require("../infrastructure/security/jwt.service");
const password_hasher_1 = require("../infrastructure/security/password-hasher");
const nodemailer_email_service_1 = require("../infrastructure/services/email/nodemailer-email.service");
exports.passwordHasher = new password_hasher_1.BcryptPasswordHasher();
exports.jwtService = new jwt_service_1.JwtServiceImpl();
exports.emailService = new nodemailer_email_service_1.NodemailerEmailService();
