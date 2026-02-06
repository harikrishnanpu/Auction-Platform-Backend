import { z } from 'zod';
import { AUTH_MESSAGES } from '../../constants/auth.constants';

export const registerSchema = z.object({
    firstName: z.string().min(1, AUTH_MESSAGES.FIRST_NAME_REQUIRED),
    lastName: z.string().min(1, AUTH_MESSAGES.LAST_NAME_REQUIRED),
    email: z.string().email(AUTH_MESSAGES.INVALID_EMAIL),
    phone: z.string().min(10, AUTH_MESSAGES.PHONE_MIN_LENGTH),
    address: z.string().min(1, AUTH_MESSAGES.ADDRESS_REQUIRED),
    avatar_url: z.string().optional(),
    password: z.string().min(6, AUTH_MESSAGES.PASSWORD_MIN_LENGTH),
});

export const loginSchema = z.object({
    email: z.string().email(AUTH_MESSAGES.INVALID_EMAIL),
    password: z.string().min(6, AUTH_MESSAGES.PASSWORD_MIN_LENGTH),
});


export const verifyEmailSchema = z.object({
    email: z.string().email(AUTH_MESSAGES.INVALID_EMAIL),
    otp: z.string().min(6, AUTH_MESSAGES.OTP_MIN_LENGTH),
});

export const completeProfileSchema = z.object({
    phone: z.string().min(10, AUTH_MESSAGES.PHONE_MIN_LENGTH),
    address: z.string().min(1, AUTH_MESSAGES.ADDRESS_REQUIRED),
});