import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/useCases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../application/useCases/auth/login-user.usecase';
import { VerifyEmailUseCase } from '../../application/useCases/auth/verify-email.usecase';
import { ResendOtpUseCase } from '../../application/useCases/auth/resend-otp.usecase';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refresh-token.usecase';
import { GetProfileUseCase } from '../../application/useCases/user/get-profile.usecase';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { RegisterUserDto, LoginUserDto } from '../../application/dtos/auth/auth.dto';

export class UserAuthController {
    constructor(
        private registerUserUseCase: RegisterUserUseCase,
        private loginUserUseCase: LoginUserUseCase,
        private verifyEmailUseCase: VerifyEmailUseCase,
        private resendOtpUseCase: ResendOtpUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private getProfileUseCase: GetProfileUseCase
    ) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
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

    refreshToken = async (req: Request, res: Response): Promise<any> => {
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
            } else {
                return res.status(401).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    resendOtp = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email } = req.body;

            console.log("Email:", email);


            if (!email.trim()) {
                return res.status(400).json({ success: false, message: "Email is required" });
            }

            const result = await this.resendOtpUseCase.execute({ email: email, purpose: "REGISTER" });

            if (result.isSuccess) {
                return res.status(200).json({ success: true, message: "OTP resent successfully" });
            } else {
                return res.status(400).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    register = async (req: Request, res: Response): Promise<any> => {
        console.log("testing");

        try {
            const parseResult = registerSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ success: false, message: "please sent correct credentials", data: { errors: parseResult.error } });
            }

            const dto: RegisterUserDto = {
                name: parseResult.data.firstName + " " + parseResult.data.lastName,
                email: parseResult.data.email,
                phone: parseResult.data.phone,
                address: parseResult.data.address,
                password: parseResult.data.password,
                avatar_url: parseResult.data.avatar_url
            };


            const result = await this.registerUserUseCase.execute(dto);

            if (result.isSuccess) {
                return res.status(201).json({
                    success: true,
                    message: "User registered successfully. Please verify your email.",
                    user: result.getValue()
                });
            } else {
                return res.status(400).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ success: false, message: "please sent correct credentials", data: { errors: parseResult.error } });
            }

            const dto: LoginUserDto = parseResult.data;
            const result = await this.loginUserUseCase.execute(dto);

            if (result.isSuccess) {
                const { accessToken, refreshToken } = result.getValue();
                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }

                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    user: result.getValue()
                });

            } else {
                return res.status(401).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    verifyEmail = async (req: Request, res: Response): Promise<any> => {
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

                return res.status(200).json({
                    success: true,
                    message: "Email verified successfully",
                    user: result.getValue()
                });
            } else {
                return res.status(400).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    getProfile = async (req: Request, res: Response): Promise<any> => {
        try {
            const userId = (req as any).user?.userId;

            console.log("User ID:", userId);

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const result = await this.getProfileUseCase.execute(userId);

            if (result.isSuccess) {
                return res.status(200).json({ success: true, user: result.getValue() });
            } else {
                return res.status(404).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
