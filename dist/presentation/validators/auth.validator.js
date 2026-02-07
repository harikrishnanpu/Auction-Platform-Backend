"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProfileSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const auth_constants_1 = require("../../constants/auth.constants");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, auth_constants_1.AUTH_MESSAGES.FIRST_NAME_REQUIRED),
    lastName: zod_1.z.string().min(1, auth_constants_1.AUTH_MESSAGES.LAST_NAME_REQUIRED),
    email: zod_1.z.string().email(auth_constants_1.AUTH_MESSAGES.INVALID_EMAIL),
    phone: zod_1.z.string().min(10, auth_constants_1.AUTH_MESSAGES.PHONE_MIN_LENGTH),
    address: zod_1.z.string().min(1, auth_constants_1.AUTH_MESSAGES.ADDRESS_REQUIRED),
    avatar_url: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6, auth_constants_1.AUTH_MESSAGES.PASSWORD_MIN_LENGTH),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(auth_constants_1.AUTH_MESSAGES.INVALID_EMAIL),
    password: zod_1.z.string().min(6, auth_constants_1.AUTH_MESSAGES.PASSWORD_MIN_LENGTH),
});
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email(auth_constants_1.AUTH_MESSAGES.INVALID_EMAIL),
    otp: zod_1.z.string().min(6, auth_constants_1.AUTH_MESSAGES.OTP_MIN_LENGTH),
});
exports.completeProfileSchema = zod_1.z.object({
    phone: zod_1.z.string().min(10, auth_constants_1.AUTH_MESSAGES.PHONE_MIN_LENGTH),
    address: zod_1.z.string().min(1, auth_constants_1.AUTH_MESSAGES.ADDRESS_REQUIRED),
});
