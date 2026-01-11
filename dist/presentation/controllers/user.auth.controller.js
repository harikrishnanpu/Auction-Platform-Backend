"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthController = void 0;
const auth_validator_1 = require("../validators/auth.validator");
class UserAuthController {
    constructor(registerUserUseCase, loginUserUseCase, verifyEmailUseCase, resendOtpUseCase, refreshTokenUseCase, getProfileUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendOtpUseCase = resendOtpUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.refreshToken = async (req, res) => {
            try {
                const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({ message: "Refresh token is required" });
                }
                const result = await this.refreshTokenUseCase.execute(refreshToken);
                if (result.isSuccess) {
                    const { accessToken, refreshToken: newRefreshToken } = result.getValue();
                    if (accessToken && newRefreshToken) {
                        this.setCookies(res, accessToken, newRefreshToken);
                    }
                    return res.status(200).json(result.getValue());
                }
                else {
                    return res.status(401).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.resendOtp = async (req, res) => {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ message: "Email is required" });
                }
                const result = await this.resendOtpUseCase.execute(email);
                if (result.isSuccess) {
                    return res.status(200).json({ message: "OTP resent successfully" });
                }
                else {
                    return res.status(400).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.register = async (req, res) => {
            try {
                const parseResult = auth_validator_1.registerSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({ errors: parseResult.error.errors });
                }
                const dto = parseResult.data;
                const result = await this.registerUserUseCase.execute(dto);
                if (result.isSuccess) {
                    return res.status(201).json({
                        message: "User registered successfully. Please verify your email.",
                        user: result.getValue()
                    });
                }
                else {
                    return res.status(400).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.login = async (req, res) => {
            try {
                const parseResult = auth_validator_1.loginSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({ errors: parseResult.error.errors });
                }
                const dto = parseResult.data;
                const result = await this.loginUserUseCase.execute(dto);
                if (result.isSuccess) {
                    const { accessToken, refreshToken } = result.getValue();
                    if (accessToken && refreshToken) {
                        this.setCookies(res, accessToken, refreshToken);
                    }
                    return res.status(200).json({
                        message: "Login successful",
                        ...result.getValue()
                    });
                }
                else {
                    return res.status(401).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.verifyEmail = async (req, res) => {
            try {
                const { email, otp } = req.body;
                if (!email || !otp) {
                    return res.status(400).json({ message: "Email and OTP are required" });
                }
                const result = await this.verifyEmailUseCase.execute({ email, otp });
                if (result.isSuccess) {
                    const { accessToken, refreshToken } = result.getValue();
                    if (accessToken && refreshToken) {
                        this.setCookies(res, accessToken, refreshToken);
                    }
                    return res.status(200).json(result.getValue());
                }
                else {
                    return res.status(400).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const result = await this.getProfileUseCase.execute(userId);
                if (result.isSuccess) {
                    return res.status(200).json(result.getValue());
                }
                else {
                    return res.status(404).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
    }
    setCookies(res, accessToken, refreshToken) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }
}
exports.UserAuthController = UserAuthController;
