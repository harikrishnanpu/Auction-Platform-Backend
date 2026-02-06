import { STATUS_CODE } from "./status.code";

export const AUTH_MESSAGES = {
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
};

export const AUTH_CONSTANTS = {
    MESSAGES: AUTH_MESSAGES,
    CODES: STATUS_CODE,
};
