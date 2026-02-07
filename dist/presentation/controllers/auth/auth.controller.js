"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthController = void 0;
const passport_1 = __importDefault(require("passport"));
const status_code_1 = require("../../../constants/status.code");
const auth_constants_1 = require("../../../constants/auth.constants");
const app_error_1 = require("../../../shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const otp_entity_1 = require("../../../domain/otp/otp.entity");
class UserAuthController {
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
            const dto = {
                name: `${firstName} ${lastName}`,
                email,
                phone,
                address,
                password,
            };
            const result = await this.registerUserUseCase.execute(dto);
            if (result.isFailure) {
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            res.status(status_code_1.STATUS_CODE.CREATED).json({
                success: true,
                code: status_code_1.STATUS_CODE.CREATED,
                message: auth_constants_1.AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
                data: result.getValue()
            });
        });
        this.verifyEmail = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, otp } = req.body;
            const dto = {
                email: email,
                otp: otp
            };
            const result = await this.verifyEmailUseCase.execute(dto);
            if (result.isFailure) {
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            const { accessToken, refreshToken } = result.getValue();
            this.setCookies(res, accessToken, refreshToken);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: auth_constants_1.AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
                user: result.getValue(),
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        });
        this.login = (0, express_async_handler_1.default)(async (req, res) => {
            const dto = req.body;
            const result = await this.loginUserUseCase.execute(dto);
            if (result.isSuccess) {
                const { accessToken, refreshToken } = result.getValue();
                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                    success: true,
                    message: auth_constants_1.AUTH_MESSAGES.LOGIN_SUCCESSFULLY,
                    user: result.getValue()
                });
            }
            else {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, code: status_code_1.STATUS_CODE.UNAUTHORIZED, message: result.error });
            }
        });
        this.getProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
                return;
            }
            const result = await this.getProfileUseCase.execute(userId);
            if (!result.isSuccess) {
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            }
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, code: status_code_1.STATUS_CODE.SUCCESS, data: { user: result.getValue() } });
        });
        this.completeProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            const { phone, address } = req.body;
            if (!userId) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
                return;
            }
            const result = await this.completeProfileUseCase.execute(userId, phone, address);
            if (!result.isSuccess) {
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, code: status_code_1.STATUS_CODE.SUCCESS, data: { user: result.getValue() } });
        });
        this.updateProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
                return;
            }
            const result = await this.updateProfileUseCase.execute({ userId, ...req.body });
            if (!result.isSuccess) {
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Profile updated successfully", data: { user: result.getValue() } });
        });
        this.sendChangePasswordOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            // We expect email in body for OTP sending to verify it's the right user/intention
            const { email } = req.body;
            if (!email) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email is required" });
                return;
            }
            const result = await this.resendOtpUseCase.execute({ email, purpose: otp_entity_1.OtpPurpose.RESET_PASSWORD });
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "OTP sent successfully" });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
        this.updatePassword = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
                return;
            }
            const { oldPassword, newPassword, confirmPassword, otp } = req.body;
            const result = await this.changePasswordUseCase.execute({
                userId,
                oldPassword,
                newPassword,
                confirmPassword,
                otp
            });
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Password updated successfully" });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
        this.refreshToken = (0, express_async_handler_1.default)(async (req, res) => {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: "Refresh token is required" });
                return;
            }
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            if (result.isSuccess) {
                const { accessToken, refreshToken: newRefreshToken } = result.getValue();
                if (accessToken && newRefreshToken) {
                    this.setCookies(res, accessToken, newRefreshToken);
                }
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, accessToken, refreshToken: newRefreshToken });
            }
            else {
                this.removeCookies(res);
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: result.error });
            }
        });
        this.resendOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            if (!email || !email.trim()) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email is required" });
                return;
            }
            const result = await this.resendOtpUseCase.execute({ email: email, purpose: "REGISTER" });
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "OTP resent successfully" });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
        this.sendVerificationOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
                return;
            }
            const result = await this.sendVerificationOtpUseCase.execute(userId);
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Verification OTP sent successfully" });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
        this.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            if (!email) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email is required" });
                return;
            }
            const dto = { email };
            const result = await this.forgotPasswordUseCase.execute(dto);
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "If your email is registered, you will receive a password reset link." });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
        this.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, token, newPassword } = req.body;
            if (!email || !token || !newPassword) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email, token and New Password are required" });
                return;
            }
            const dto = { email, token, newPassword };
            const result = await this.resetPasswordUseCase.execute(dto);
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Password has been reset successfully. Please login with new password." });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
        this.logout = (0, express_async_handler_1.default)(async (req, res) => {
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, code: status_code_1.STATUS_CODE.SUCCESS, message: auth_constants_1.AUTH_MESSAGES.LOGGED_OUT_SUCCESSFULLY });
        });
        this.googleAuth = (req, res, next) => {
            const callBackUrl = req.query.callBack || '/login';
            const state = Buffer.from(callBackUrl).toString('base64');
            passport_1.default.authenticate('google', {
                scope: ['profile', 'email'],
                session: false,
                state: state
            })(req, res, next);
        };
        this.googleAuthCallback = async (req, res, next) => {
            passport_1.default.authenticate('google', { session: false }, async (err, user, info) => {
                console.log(user);
                const rawState = req.query.state;
                const returnTo = rawState ? Buffer.from(rawState, 'base64').toString('ascii') : '/login';
                console.log(rawState);
                console.log(returnTo);
                const clientRedirectUrl = `${process.env.FRONTEND_URL}/${returnTo}`;
                if (err) {
                    return res.redirect(`${clientRedirectUrl}?error=GoogleAuthFailed`);
                }
                if (!user) {
                    return res.redirect(`${clientRedirectUrl}?error=NoUser`);
                }
                try {
                    const result = await this.loginWithGoogleUseCase.execute(user);
                    if (result.isSuccess) {
                        const { accessToken, refreshToken, user: domainUser } = result.getValue();
                        this.setCookies(res, accessToken, refreshToken);
                        return res.redirect(`${process.env.FRONTEND_URL}/home`);
                    }
                    else {
                        return res.redirect(`${clientRedirectUrl}?error=${encodeURIComponent(result.error)}`);
                    }
                }
                catch (error) {
                    console.log(error);
                    return res.redirect(`${clientRedirectUrl}?error=InternalServerError`);
                }
            })(req, res, next);
        };
        this.updateAvatar = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ success: false, message: auth_constants_1.AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
                return;
            }
            const { avatarKey } = req.body;
            if (!avatarKey) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Avatar key is required" });
                return;
            }
            const result = await this.updateAvatarUseCase.execute({
                userId,
                avatarKey
            });
            if (result.isSuccess) {
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Avatar updated successfully", data: { user: result.getValue() } });
            }
            else {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
            }
        });
    }
    setCookies(res, accessToken, refreshToken) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }
    removeCookies(res) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }
}
exports.UserAuthController = UserAuthController;
