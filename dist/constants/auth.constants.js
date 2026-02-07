"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_CONSTANTS = exports.AUTH_MESSAGES = void 0;
const status_code_1 = require("./status.code");
exports.AUTH_MESSAGES = {
    USER_REGISTERED_SUCCESSFULLY: "User registered successfully. Please verify your email.",
    USER_ALREADY_EXISTS: "User already exists with this email or phone",
    INVALID_INPUT: "Invalid registration data",
    INTERNAL_SERVER_ERROR: "An unexpected error occurred during registration",
    FIRST_NAME_REQUIRED: "First Name is required",
    LAST_NAME_REQUIRED: "Last Name is required",
    INVALID_EMAIL: "Invalid email address",
    PHONE_MIN_LENGTH: "Phone number must be at least 10 digits",
    ADDRESS_REQUIRED: "Address is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
    OTP_MIN_LENGTH: "OTP must be 6 digits",
    EMAIL_VERIFIED_SUCCESSFULLY: "Email verified successfully",
    LOGIN_SUCCESSFULLY: "Login successful",
    PROFILE_NOT_FOUND: "User profile not found",
    AUTHENTICATION_REQUIRED: "Authentication Required",
    LOGGED_OUT_SUCCESSFULLY: "Logged out successfully",
};
exports.AUTH_CONSTANTS = {
    MESSAGES: exports.AUTH_MESSAGES,
    CODES: status_code_1.STATUS_CODE,
};
