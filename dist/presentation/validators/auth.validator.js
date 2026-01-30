"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First Name is required"),
    lastName: zod_1.z.string().min(1, "Last Name is required"),
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits"),
    address: zod_1.z.string().min(1, "Address is required"),
    avatar_url: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    otp: zod_1.z.string().min(6, "OTP must be 6 digits"),
});
