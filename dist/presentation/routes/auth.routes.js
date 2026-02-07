"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_validator_1 = require("../validators/auth.validator");
class AuthRoutes {
    constructor(_authController) {
        this._authController = _authController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.post('/register', (0, validation_middleware_1.validateRequest)(auth_validator_1.registerSchema), this._authController.register);
        this._router.post('/verify-email', (0, validation_middleware_1.validateRequest)(auth_validator_1.verifyEmailSchema), this._authController.verifyEmail);
        this._router.post('/login', (0, validation_middleware_1.validateRequest)(auth_validator_1.loginSchema), this._authController.login);
        this._router.post('/send-verification-otp', authenticate_middleware_1.authenticate, this._authController.sendVerificationOtp);
        this._router.post('/resend-otp', this._authController.resendOtp);
        this._router.post('/refresh-token', this._authController.refreshToken);
        this._router.post('/forgot-password', this._authController.forgotPassword);
        this._router.post('/reset-password', this._authController.resetPassword);
        this._router.get('/google', this._authController.googleAuth);
        this._router.get('/google/callback', this._authController.googleAuthCallback);
        this._router.get('/me', authenticate_middleware_1.authenticate, this._authController.getProfile);
        this._router.put('/complete-profile', authenticate_middleware_1.authenticate, (0, validation_middleware_1.validateRequest)(auth_validator_1.completeProfileSchema), this._authController.completeProfile);
        this._router.patch('/profile', authenticate_middleware_1.authenticate, this._authController.updateProfile);
        this._router.post('/change-password/otp', authenticate_middleware_1.authenticate, this._authController.sendChangePasswordOtp);
        this._router.patch('/avatar', authenticate_middleware_1.authenticate, this._authController.updateAvatar);
        this._router.patch('/change-password', authenticate_middleware_1.authenticate, this._authController.updatePassword);
        this._router.get('/logout', this._authController.logout);
        this._router.post('/logout', this._authController.logout);
        return this._router;
    }
}
exports.AuthRoutes = AuthRoutes;
