"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const passport_1 = __importDefault(require("passport"));
const status_code_1 = require("constants/status.code");
const auth_constants_1 = require("constants/auth.constants");
const app_error_1 = require("shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
class AuthController {
    constructor(registerUserUseCase, loginUserUseCase, verifyEmailUseCase, resendOtpUseCase, refreshTokenUseCase, getProfileUseCase, completeProfileUseCase, updateProfileUseCase, updateAvatarUseCase, changePasswordUseCase, forgotPasswordUseCase, resetPasswordUseCase, loginWithGoogleUseCase, sendVerificationOtpUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendOtpUseCase = resendOtpUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.completeProfileUseCase = completeProfileUseCase;
        this.updateProfileUseCase = updateProfileUseCase;
        this.updateAvatarUseCase = updateAvatarUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.loginWithGoogleUseCase = loginWithGoogleUseCase;
        this.sendVerificationOtpUseCase = sendVerificationOtpUseCase;
        this.register = (0, express_async_handler_1.default)(async (req, res) => {
            const { firstName, lastName, email, phone, address, password } = req.body;
            const dto = { name: `${firstName} ${lastName}`, email, phone, address, password };
            const result = await this.registerUserUseCase.execute(dto);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.CREATED).json({
                success: true,
                message: auth_constants_1.AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
                data: result.getValue()
            });
        });
        this.verifyEmail = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, otp } = req.body;
            const dto = { email, otp };
            const result = await this.verifyEmailUseCase.execute(dto);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            const { accessToken, refreshToken } = result.getValue();
            this.setCookies(res, accessToken, refreshToken);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: auth_constants_1.AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
                user: result.getValue()
            });
        });
        this.login = (0, express_async_handler_1.default)(async (req, res) => {
            const dto = req.body;
            const result = await this.loginUserUseCase.execute(dto);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { accessToken, refreshToken } = result.getValue();
            this.setCookies(res, accessToken, refreshToken);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: auth_constants_1.AUTH_MESSAGES.LOGIN_SUCCESSFULLY,
                user: result.getValue()
            });
        });
        this.getProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError(auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.getProfileUseCase.execute(userId);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, user: result.getValue() });
        });
        this.completeProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            const { phone, address } = req.body;
            if (!userId)
                throw new app_error_1.AppError(auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.completeProfileUseCase.execute({ userId, phone, address });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: { user: result.getValue() } });
        });
        this.updateProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError(auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.updateProfileUseCase.execute({ userId, ...req.body });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Profile updated successfully", data: { user: result.getValue() } });
        });
        this.sendChangePasswordOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            if (!email)
                throw new app_error_1.AppError("Email is required", status_code_1.STATUS_CODE.BAD_REQUEST);
            const result = await this.resendOtpUseCase.execute({ email, purpose: otp_entity_1.OtpPurpose.RESET_PASSWORD });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "OTP sent successfully" });
        });
        this.updatePassword = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError(auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.changePasswordUseCase.execute({ userId, ...req.body });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Password updated successfully" });
        });
        this.refreshToken = (0, express_async_handler_1.default)(async (req, res) => {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                throw new app_error_1.AppError("Refresh token is required", status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { accessToken, refreshToken: newRefreshToken } = result.getValue();
            this.setCookies(res, accessToken, newRefreshToken);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, accessToken, refreshToken: newRefreshToken });
        });
        this.resendOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, purpose } = req.body;
            const result = await this.resendOtpUseCase.execute({ email, purpose });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "OTP resent successfully" });
        });
        this.sendVerificationOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError(auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.sendVerificationOtpUseCase.execute(userId);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Verification OTP sent successfully" });
        });
        this.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            if (!email)
                throw new app_error_1.AppError("Email is required", status_code_1.STATUS_CODE.BAD_REQUEST);
            const result = await this.forgotPasswordUseCase.execute({ email });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "If your email is registered, you will receive a password reset link." });
        });
        this.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const result = await this.resetPasswordUseCase.execute(req.body);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Password reset successfully" });
        });
        this.logout = (0, express_async_handler_1.default)(async (req, res) => {
            this.removeCookies(res);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: auth_constants_1.AUTH_MESSAGES.LOGGED_OUT_SUCCESSFULLY });
        });
        this.googleAuth = (req, res, next) => {
            passport_1.default.authenticate('google', {
                scope: ['profile', 'email'],
                session: false,
            })(req, res, next);
        };
        this.googleAuthCallback = (0, express_async_handler_1.default)(async (req, res) => {
            passport_1.default.authenticate('google', { session: false }, async (err, user) => {
                if (err || !user) {
                    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Google authentication failed`);
                }
                const result = await this.loginWithGoogleUseCase.execute(user);
                if (result.isFailure) {
                    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(result.error)}`);
                }
                const { accessToken, refreshToken } = result.getValue();
                this.setCookies(res, accessToken, refreshToken);
                res.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
            })(req, res);
        });
        this.updateAvatar = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            const { avatarKey } = req.body;
            if (!userId)
                throw new app_error_1.AppError(auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            if (!avatarKey)
                throw new app_error_1.AppError("Avatar key is required", status_code_1.STATUS_CODE.BAD_REQUEST);
            const result = await this.updateAvatarUseCase.execute({ userId, avatarKey });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Avatar updated successfully", data: { user: result.getValue() } });
        });
    }
    setCookies(res, accessToken, refreshToken) {
        const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        };
        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    }
    removeCookies(res) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }
}
exports.AuthController = AuthController;
