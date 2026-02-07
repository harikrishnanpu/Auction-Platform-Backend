import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/useCases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../../application/useCases/auth/login-user.usecase';
import { VerifyEmailUseCase } from '../../../application/useCases/auth/verify-email.usecase';
import { ResendOtpUseCase } from '../../../application/useCases/auth/resend-otp.usecase';
import { ForgotPasswordUseCase } from '../../../application/useCases/auth/forgot-password.usecase';
import { ResetPasswordUseCase } from '../../../application/useCases/auth/reset-password.usecase';
import { RefreshTokenUseCase } from '../../../application/useCases/auth/refresh-token.usecase';
import { GetProfileUseCase } from '../../../application/useCases/user/get-profile.usecase';
import { CompleteProfileUseCase } from '../../../application/useCases/user/complete-profile.usecase';
import { UpdateProfileUseCase } from '../../../application/useCases/user/update-profile.usecase';
import { ChangePasswordUseCase } from '../../../application/useCases/user/change-password.usecase';
import { UpdateAvatarUseCase } from '../../../application/useCases/user/update-avatar.usecase';
import { RegisterUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from '../../../application/dtos/auth/auth.dto';
import { LoginWithGoogleUseCase } from '../../../application/useCases/auth/login-google.usecase';
import passport from 'passport';
import { STATUS_CODE } from '../../../constants/status.code';
import { AUTH_MESSAGES } from '../../../constants/auth.constants';
import { AppError } from '../../../shared/app.error';
import expressAsyncHandler from 'express-async-handler';
import { SendVerificationOtpUseCase } from '../../../application/useCases/auth/send-verification-otp.usecase';
import { OtpPurpose } from '../../../domain/otp/otp.entity';


export class UserAuthController {

    constructor(
        private registerUserUseCase: RegisterUserUseCase,
        private loginUserUseCase: LoginUserUseCase,
        private verifyEmailUseCase: VerifyEmailUseCase,
        private resendOtpUseCase: ResendOtpUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private getProfileUseCase: GetProfileUseCase,
        private completeProfileUseCase: CompleteProfileUseCase,
        private updateProfileUseCase: UpdateProfileUseCase,
        private updateAvatarUseCase: UpdateAvatarUseCase,
        private changePasswordUseCase: ChangePasswordUseCase,
        private forgotPasswordUseCase: ForgotPasswordUseCase,
        private resetPasswordUseCase: ResetPasswordUseCase,
        private loginWithGoogleUseCase: LoginWithGoogleUseCase,
        private sendVerificationOtpUseCase: SendVerificationOtpUseCase,
    ) { }


    private setCookies(res: Response, accessToken: string, refreshToken: string) {
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


    private removeCookies(res: Response) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }





    register = expressAsyncHandler(async (req: Request, res: Response) => {
        const { firstName, lastName, email, phone, address, password } = req.body;

        const dto: RegisterUserDto = {
            name: `${firstName} ${lastName}`,
            email,
            phone,
            address,
            password,
        };

        const result = await this.registerUserUseCase.execute(dto);

        if (result.isFailure) {
            throw new AppError(result.error as string, STATUS_CODE.BAD_REQUEST);
        }

        res.status(STATUS_CODE.CREATED).json({
            success: true,
            code: STATUS_CODE.CREATED,
            message: AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
            data: result.getValue()
        });
    });






    verifyEmail = expressAsyncHandler(async (req: Request, res: Response) => {

        const { email, otp } = req.body;

        const dto: VerifyEmailDto = {
            email: email,
            otp: otp
        };

        const result = await this.verifyEmailUseCase.execute(dto);

        if (result.isFailure) {
            throw new AppError(result.error as string, STATUS_CODE.BAD_REQUEST);
        }

        const { accessToken, refreshToken } = result.getValue();
        this.setCookies(res, accessToken as string, refreshToken as string);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
            user: result.getValue(),
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    });







    login = expressAsyncHandler(async (req: Request, res: Response) => {
        const dto: LoginUserDto = req.body;
        const result = await this.loginUserUseCase.execute(dto);

        if (result.isSuccess) {
            const { accessToken, refreshToken } = result.getValue();
            if (accessToken && refreshToken) {
                this.setCookies(res, accessToken, refreshToken);
            }

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: AUTH_MESSAGES.LOGIN_SUCCESSFULLY,
                user: result.getValue()
            });

        } else {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, code: STATUS_CODE.UNAUTHORIZED, message: result.error });
        }
    });







    getProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        if (!userId) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
            return;
        }

        const result = await this.getProfileUseCase.execute(userId);

        if (!result.isSuccess) {
            throw new AppError(result.error as string, STATUS_CODE.NOT_FOUND);
        }

        res.status(STATUS_CODE.SUCCESS).json({ success: true, code: STATUS_CODE.SUCCESS, data: { user: result.getValue() } });
    });



    completeProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        const { phone, address } = req.body;

        if (!userId) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
            return;
        }

        const result = await this.completeProfileUseCase.execute(userId, phone, address);

        if (!result.isSuccess) {
            throw new AppError(result.error as string, STATUS_CODE.BAD_REQUEST);
        }

        res.status(STATUS_CODE.SUCCESS).json({ success: true, code: STATUS_CODE.SUCCESS, data: { user: result.getValue() } });
    });

    updateProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        if (!userId) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
            return;
        }

        const result = await this.updateProfileUseCase.execute({ userId, ...req.body });

        if (!result.isSuccess) {
            throw new AppError(result.error as string, STATUS_CODE.BAD_REQUEST);
        }

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Profile updated successfully", data: { user: result.getValue() } });
    });

    sendChangePasswordOtp = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        // We expect email in body for OTP sending to verify it's the right user/intention
        const { email } = req.body;

        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email is required" });
            return;
        }

        const result = await this.resendOtpUseCase.execute({ email, purpose: OtpPurpose.RESET_PASSWORD });

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "OTP sent successfully" });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });

    updatePassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
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
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Password updated successfully" });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });

    refreshToken = expressAsyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: "Refresh token is required" });
            return;
        }

        const result = await this.refreshTokenUseCase.execute(refreshToken);

        if (result.isSuccess) {
            const { accessToken, refreshToken: newRefreshToken } = result.getValue();
            if (accessToken && newRefreshToken) {
                this.setCookies(res, accessToken, newRefreshToken);
            }
            res.status(STATUS_CODE.SUCCESS).json({ success: true, accessToken, refreshToken: newRefreshToken });
        } else {
            this.removeCookies(res);
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: result.error });
        }
    });


    resendOtp = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;

        if (!email || !email.trim()) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email is required" });
            return;
        }

        const result = await this.resendOtpUseCase.execute({ email: email, purpose: "REGISTER" });

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "OTP resent successfully" });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });

    sendVerificationOtp = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        if (!userId) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
            return;
        }

        const result = await this.sendVerificationOtpUseCase.execute(userId);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Verification OTP sent successfully" });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });









    forgotPassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email is required" });
            return;
        }

        const dto: ForgotPasswordDto = { email };
        const result = await this.forgotPasswordUseCase.execute(dto);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "If your email is registered, you will receive a password reset link." });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });

    resetPassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Email, token and New Password are required" });
            return;
        }

        const dto: ResetPasswordDto = { email, token, newPassword };
        const result = await this.resetPasswordUseCase.execute(dto);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Password has been reset successfully. Please login with new password." });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });

    logout = expressAsyncHandler(async (req: Request, res: Response) => {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        res.status(STATUS_CODE.SUCCESS).json({ success: true, code: STATUS_CODE.SUCCESS, message: AUTH_MESSAGES.LOGGED_OUT_SUCCESSFULLY });
    });

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
                    return res.redirect(`${process.env.FRONTEND_URL}/home`);
                } else {
                    return res.redirect(`${clientRedirectUrl}?error=${encodeURIComponent(result.error as string)}`);
                }
            } catch (error) {
                console.log(error);
                return res.redirect(`${clientRedirectUrl}?error=InternalServerError`);
            }
        })(req, res, next);
    }


    updateAvatar = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) {
            res.status(STATUS_CODE.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.AUTHENTICATION_REQUIRED });
            return;
        }

        const { avatarKey } = req.body;

        if (!avatarKey) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Avatar key is required" });
            return;
        }

        const result = await this.updateAvatarUseCase.execute({
            userId,
            avatarKey
        });

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Avatar updated successfully", data: { user: result.getValue() } });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    });
}

