"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthController = void 0;
const auth_validator_1 = require("../validators/auth.validator");
const passport_1 = __importDefault(require("passport"));
const http_status_constants_1 = require("../../application/constants/http-status.constants");
const response_messages_1 = require("../../application/constants/response.messages");
class UserAuthController {
    constructor(registerUserUseCase, loginUserUseCase, verifyEmailUseCase, resendOtpUseCase, refreshTokenUseCase, getProfileUseCase, forgotPasswordUseCase, resetPasswordUseCase, loginWithGoogleUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendOtpUseCase = resendOtpUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.loginWithGoogleUseCase = loginWithGoogleUseCase;
        this.refreshToken = async (req, res) => {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ success: false, message: response_messages_1.ResponseMessages.REFRESH_TOKEN_REQUIRED });
                }
                const result = await this.refreshTokenUseCase.execute(refreshToken);
                if (result.isSuccess) {
                    const { accessToken, refreshToken: newRefreshToken } = result.getValue();
                    if (accessToken && newRefreshToken) {
                        this.setCookies(res, accessToken, newRefreshToken);
                    }
                    return res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, accessToken, refreshToken: newRefreshToken });
                }
                else {
                    this.removeCookies(res);
                    return res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ success: false, message: result.error });
                }
            }
            catch (err) {
                console.log("RefreshToken Error:", err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.resendOtp = async (req, res) => {
            try {
                const { email } = req.body;
                console.log("Email:", email);
                if (!email.trim()) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: response_messages_1.ResponseMessages.EMAIL_REQUIRED });
                }
                const result = await this.resendOtpUseCase.execute({ email: email, purpose: "REGISTER" });
                if (result.isSuccess) {
                    return res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.OTP_RESENT_SUCCESS });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.register = async (req, res) => {
            console.log("testing");
            try {
                const parseResult = auth_validator_1.registerSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: response_messages_1.ResponseMessages.INVALID_CREDENTIALS, data: { errors: parseResult.error } });
                }
                const dto = {
                    name: parseResult.data.firstName + " " + parseResult.data.lastName,
                    email: parseResult.data.email,
                    phone: parseResult.data.phone,
                    address: parseResult.data.address,
                    password: parseResult.data.password,
                    avatar_url: parseResult.data.avatar_url
                };
                const result = await this.registerUserUseCase.execute(dto);
                if (result.isSuccess) {
                    return res.status(http_status_constants_1.HttpStatus.CREATED).json({
                        success: true,
                        message: response_messages_1.ResponseMessages.USER_REGISTERED_VERIFY_EMAIL,
                        user: result.getValue()
                    });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.login = async (req, res) => {
            try {
                const parseResult = auth_validator_1.loginSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: response_messages_1.ResponseMessages.INVALID_CREDENTIALS, data: { errors: parseResult.error } });
                }
                const dto = parseResult.data;
                const result = await this.loginUserUseCase.execute(dto);
                if (result.isSuccess) {
                    const { accessToken, refreshToken } = result.getValue();
                    if (accessToken && refreshToken) {
                        this.setCookies(res, accessToken, refreshToken);
                    }
                    return res.status(http_status_constants_1.HttpStatus.OK).json({
                        success: true,
                        message: response_messages_1.ResponseMessages.LOGIN_SUCCESS,
                        user: result.getValue()
                    });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.verifyEmail = async (req, res) => {
            try {
                const parseResult = auth_validator_1.verifyEmailSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: response_messages_1.ResponseMessages.INVALID_CREDENTIALS, error: parseResult.error });
                }
                const dto = {
                    email: parseResult.data.email,
                    otp: parseResult.data.otp
                };
                const result = await this.verifyEmailUseCase.execute(dto);
                if (result.isSuccess) {
                    const { accessToken, refreshToken } = result.getValue();
                    if (accessToken && refreshToken) {
                        this.setCookies(res, accessToken, refreshToken);
                    }
                    return res.status(http_status_constants_1.HttpStatus.OK).json({
                        success: true,
                        message: response_messages_1.ResponseMessages.EMAIL_VERIFIED_SUCCESS,
                        user: result.getValue()
                    });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ success: false, message: response_messages_1.ResponseMessages.AUTHENTICATION_REQUIRED });
                }
                const result = await this.getProfileUseCase.execute(userId);
                if (result.isSuccess) {
                    return res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, user: result.getValue() });
                }
                else {
                    this.removeCookies(res);
                    return res.status(http_status_constants_1.HttpStatus.NOT_FOUND).json({ success: false, message: response_messages_1.ResponseMessages.USER_NOT_FOUND });
                }
            }
            catch (err) {
                console.error("GetProfile Error:", err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.forgotPassword = async (req, res) => {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: response_messages_1.ResponseMessages.EMAIL_REQUIRED });
                }
                const dto = { email };
                const result = await this.forgotPasswordUseCase.execute(dto);
                if (result.isSuccess) {
                    return res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.PASSWORD_RESET_LINK_SENT });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.resetPassword = async (req, res) => {
            try {
                const { email, token, newPassword } = req.body;
                if (!email || !token || !newPassword) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: response_messages_1.ResponseMessages.RESET_PASSWORD_FIELDS_REQUIRED });
                }
                const dto = { email, token, newPassword };
                const result = await this.resetPasswordUseCase.execute(dto);
                if (result.isSuccess) {
                    return res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.PASSWORD_RESET_SUCCESS });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.logout = async (req, res) => {
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });
            return res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.LOGGED_OUT_SUCCESS });
        };
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
                const clientRedirectUrl = `${process.env.CLIENT_URL}/${returnTo}`;
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
                        return res.redirect(`${process.env.CLIENT_URL}/`);
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
    }
    setCookies(res, accessToken, refreshToken) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
    removeCookies(res) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }
}
exports.UserAuthController = UserAuthController;
