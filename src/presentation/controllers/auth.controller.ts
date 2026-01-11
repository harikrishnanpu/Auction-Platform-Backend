import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/useCases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../application/useCases/auth/login-user.usecase';
import { VerifyEmailUseCase } from '../../application/useCases/auth/verify-email.usecase';
import { ResendOtpUseCase } from '../../application/useCases/auth/resend-otp.usecase';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refresh-token.usecase';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { RegisterUserDto, LoginUserDto } from '../../application/dtos/auth/auth.dto';

export class AuthController {
    constructor(
        private registerUserUseCase: RegisterUserUseCase,
        private loginUserUseCase: LoginUserUseCase,
        private verifyEmailUseCase: VerifyEmailUseCase,
        private resendOtpUseCase: ResendOtpUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase
    ) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // or 'strict' if on same domain
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const result = await this.resendOtpUseCase.execute(email);

            if (result.isSuccess) {
                return res.status(200).json({ message: "OTP resent successfully" });
            } else {
                return res.status(400).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    register = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = registerSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ errors: (parseResult.error as any).errors });
            }

            const dto: RegisterUserDto = parseResult.data;
            const result = await this.registerUserUseCase.execute(dto);

            if (result.isSuccess) {
                return res.status(201).json({
                    message: "User registered successfully. Please verify your email.",
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

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ errors: (parseResult.error as any).errors });
            }

            const dto: LoginUserDto = parseResult.data;
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
                return res.status(200).json(result.getValue());
            } else {
                return res.status(400).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
