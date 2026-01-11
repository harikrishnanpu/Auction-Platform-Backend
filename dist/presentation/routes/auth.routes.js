"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
class AuthRoutes {
    constructor(_authController) {
        this._authController = _authController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.post('/register', this._authController.register);
        this._router.post('/login', this._authController.login);
        this._router.post('/verify-email', this._authController.verifyEmail);
        this._router.post('/resend-otp', this._authController.resendOtp);
        this._router.post('/refresh-token', this._authController.refreshToken);
        this._router.get('/me', authenticate_middleware_1.authenticate, this._authController.getProfile);
        return this._router;
    }
}
exports.AuthRoutes = AuthRoutes;
