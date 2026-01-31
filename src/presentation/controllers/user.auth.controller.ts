import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/useCases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../application/useCases/auth/login-user.usecase';
import { VerifyEmailUseCase } from '../../application/useCases/auth/verify-email.usecase';
import { ResendOtpUseCase } from '../../application/useCases/auth/resend-otp.usecase';
import { ForgotPasswordUseCase } from '../../application/useCases/auth/forgot-password.usecase';
import { ResetPasswordUseCase } from '../../application/useCases/auth/reset-password.usecase';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refresh-token.usecase';
import { GetProfileUseCase } from '../../application/useCases/user/get-profile.usecase';
import { registerSchema, loginSchema, verifyEmailSchema } from '../validators/auth.validator';
import { RegisterUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from '../../application/dtos/auth/auth.dto';
import { LoginWithGoogleUseCase } from '../../application/useCases/auth/login-google.usecase';
import passport from 'passport';
import { HttpStatus } from '../../application/constants/http-status.constants';
import { ResponseMessages } from '../../application/constants/response.messages';


export class UserAuthController {
    constructor(
        private registerUserUseCase: RegisterUserUseCase,
        private loginUserUseCase: LoginUserUseCase,
        private verifyEmailUseCase: VerifyEmailUseCase,
        private resendOtpUseCase: ResendOtpUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private getProfileUseCase: GetProfileUseCase,
        private forgotPasswordUseCase: ForgotPasswordUseCase,
        private resetPasswordUseCase: ResetPasswordUseCase,
        private loginWithGoogleUseCase: LoginWithGoogleUseCase,
    ) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
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


    private removeCookies(res: Response) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }

    refreshToken = async (req: Request, res: Response): Promise<any> => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: ResponseMessages.REFRESH_TOKEN_REQUIRED });
            }

            const result = await this.refreshTokenUseCase.execute(refreshToken);

            if (result.isSuccess) {
                const { accessToken, refreshToken: newRefreshToken } = result.getValue();
                if (accessToken && newRefreshToken) {
                    this.setCookies(res, accessToken, newRefreshToken);
                }
                return res.status(HttpStatus.OK).json({ success: true, accessToken, refreshToken: newRefreshToken });
            } else {
                this.removeCookies(res);
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log("RefreshToken Error:", err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    resendOtp = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email } = req.body;

            console.log("Email:", email);


            if (!email.trim()) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: ResponseMessages.EMAIL_REQUIRED });
            }

            const result = await this.resendOtpUseCase.execute({ email: email, purpose: "REGISTER" });

            if (result.isSuccess) {
                return res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.OTP_RESENT_SUCCESS });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    register = async (req: Request, res: Response): Promise<any> => {
        console.log("testing");

        try {
            const parseResult = registerSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: ResponseMessages.INVALID_CREDENTIALS, data: { errors: parseResult.error } });
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
                return res.status(HttpStatus.CREATED).json({
                    success: true,
                    message: ResponseMessages.USER_REGISTERED_VERIFY_EMAIL,
                    user: result.getValue()
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: ResponseMessages.INVALID_CREDENTIALS, data: { errors: parseResult.error } });
            }

            const dto: LoginUserDto = parseResult.data;
            const result = await this.loginUserUseCase.execute(dto);

            if (result.isSuccess) {
                const { accessToken, refreshToken } = result.getValue();
                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }

                return res.status(HttpStatus.OK).json({
                    success: true,
                    message: ResponseMessages.LOGIN_SUCCESS,
                    user: result.getValue()
                });

            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    verifyEmail = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = verifyEmailSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: ResponseMessages.INVALID_CREDENTIALS, error: parseResult.error });
            }

            const dto: VerifyEmailDto = {
                email: parseResult.data.email,
                otp: parseResult.data.otp
            };

            const result = await this.verifyEmailUseCase.execute(dto);

            if (result.isSuccess) {
                const { accessToken, refreshToken } = result.getValue();


                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }


                return res.status(HttpStatus.OK).json({
                    success: true,
                    message: ResponseMessages.EMAIL_VERIFIED_SUCCESS,
                    user: result.getValue()
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    getProfile = async (req: Request, res: Response): Promise<any> => {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: ResponseMessages.AUTHENTICATION_REQUIRED });
            }

            const result = await this.getProfileUseCase.execute(userId);

            if (result.isSuccess) {
                return res.status(HttpStatus.OK).json({ success: true, user: result.getValue() });
            } else {
                this.removeCookies(res);
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: ResponseMessages.USER_NOT_FOUND });
            }
        } catch (err) {
            console.error("GetProfile Error:", err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: ResponseMessages.EMAIL_REQUIRED });
            }

            const dto: ForgotPasswordDto = { email };
            const result = await this.forgotPasswordUseCase.execute(dto);

            if (result.isSuccess) {
                return res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.PASSWORD_RESET_LINK_SENT });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    resetPassword = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email, token, newPassword } = req.body;

            if (!email || !token || !newPassword) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: ResponseMessages.RESET_PASSWORD_FIELDS_REQUIRED });
            }

            const dto: ResetPasswordDto = { email, token, newPassword };
            const result = await this.resetPasswordUseCase.execute(dto);

            if (result.isSuccess) {
                return res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.PASSWORD_RESET_SUCCESS });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    logout = async (req: Request, res: Response): Promise<any> => {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        return res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.LOGGED_OUT_SUCCESS });
    }

    googleAuth = (req: Request, res: Response, next: any) => {
        const callBackUrl = (req.query.callBack as string) || '/login';
        const state = Buffer.from(callBackUrl).toString('base64');

        passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false,
            state: state
        })(req, res, next);
    }

    googleAuthCallback = async (req: Request, res: Response, next: any) => {
        passport.authenticate('google', { session: false }, async (err: any, user: any, info: any) => {
            console.log(user)
            const rawState = req.query.state as string;
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
                    return res.redirect(`${process.env.FRONTEND_URL}/`);
                } else {
                    return res.redirect(`${clientRedirectUrl}?error=${encodeURIComponent(result.error as string)}`);
                }
            } catch (error) {
                console.log(error);
                return res.redirect(`${clientRedirectUrl}?error=InternalServerError`);
            }
        })(req, res, next);
    }
}

