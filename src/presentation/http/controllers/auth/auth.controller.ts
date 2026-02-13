import { Request, Response } from 'express';
import passport from 'passport';
import { STATUS_CODE } from 'constants/status.code';
import { AUTH_MESSAGES } from 'constants/auth.constants';
import { AppError } from 'shared/app.error';
import expressAsyncHandler from 'express-async-handler';
import { OtpPurpose } from '@domain/entities/otp/otp.entity';
import { RegisterUserDto, VerifyEmailDto, LoginUserDto } from '@application/dtos/auth/auth.dto';


import {
    IRegisterUserUseCase,
    ILoginUserUseCase,
    IVerifyEmailUseCase,
    IResendOtpUseCase,
    IRefreshTokenUseCase,
    IForgotPasswordUseCase,
    IResetPasswordUseCase,
    ILoginGoogleUseCase,
    ISendVerificationOtpUseCase
} from '@application/interfaces/use-cases/auth.usecase.interface';
import {
    IGetProfileUseCase,
    ICompleteProfileUseCase,
    IUpdateProfileUseCase,
    IUpdateAvatarUseCase,
    IChangePasswordUseCase
} from '@application/interfaces/use-cases/user.usecase.interface';



export class AuthController {

    constructor(
        private registerUserUseCase: IRegisterUserUseCase,
        private loginUserUseCase: ILoginUserUseCase,
        private verifyEmailUseCase: IVerifyEmailUseCase,
        private resendOtpUseCase: IResendOtpUseCase,
        private refreshTokenUseCase: IRefreshTokenUseCase,
        private getProfileUseCase: IGetProfileUseCase,
        private completeProfileUseCase: ICompleteProfileUseCase,
        private updateProfileUseCase: IUpdateProfileUseCase,
        private updateAvatarUseCase: IUpdateAvatarUseCase,
        private changePasswordUseCase: IChangePasswordUseCase,
        private forgotPasswordUseCase: IForgotPasswordUseCase,
        private resetPasswordUseCase: IResetPasswordUseCase,
        private loginWithGoogleUseCase: ILoginGoogleUseCase,
        private sendVerificationOtpUseCase: ISendVerificationOtpUseCase,
    ) { }


    private setCookies(res: Response, accessToken: string, refreshToken: string) {

        const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: 'lax' as const,
            path: '/',
        };

        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    }


    private removeCookies(res: Response) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
    }

    register = expressAsyncHandler(async (req: Request, res: Response) => {
        const { firstName, lastName, email, phone, address, password } = req.body;
        const dto: RegisterUserDto = { name: `${firstName} ${lastName}`, email, phone, address, password };

        const result = await this.registerUserUseCase.execute(dto);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.CREATED).json({
            success: true,
            message: AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
            data: result.getValue()
        });
    });

    verifyEmail = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        const dto: VerifyEmailDto = { email, otp };

        const result = await this.verifyEmailUseCase.execute(dto);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        const { accessToken, refreshToken } = result.getValue();
        this.setCookies(res, accessToken, refreshToken);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
            user: result.getValue()
        });
    });

    login = expressAsyncHandler(async (req: Request, res: Response) => {
        const dto: LoginUserDto = req.body;
        const result = await this.loginUserUseCase.execute(dto);

        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.UNAUTHORIZED);

        const { accessToken, refreshToken } = result.getValue();
        this.setCookies(res, accessToken, refreshToken);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: AUTH_MESSAGES.LOGIN_SUCCESSFULLY,
            user: result.getValue()
        });
    });

    getProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError(AUTH_MESSAGES.AUTHENTICATION_REQUIRED, STATUS_CODE.UNAUTHORIZED);

        const result = await this.getProfileUseCase.execute(userId);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.NOT_FOUND);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, user: result.getValue() });
    });

    completeProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        const { phone, address } = req.body;
        if (!userId) throw new AppError(AUTH_MESSAGES.AUTHENTICATION_REQUIRED, STATUS_CODE.UNAUTHORIZED);

        const result = await this.completeProfileUseCase.execute({ userId, phone, address });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: { user: result.getValue() } });
    });

    updateProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError(AUTH_MESSAGES.AUTHENTICATION_REQUIRED, STATUS_CODE.UNAUTHORIZED);

        const result = await this.updateProfileUseCase.execute({ userId, ...req.body });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Profile updated successfully", data: { user: result.getValue() } });
    });

    sendChangePasswordOtp = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) throw new AppError("Email is required", STATUS_CODE.BAD_REQUEST);

        const result = await this.resendOtpUseCase.execute({ email, purpose: OtpPurpose.RESET_PASSWORD });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "OTP sent successfully" });
    });

    updatePassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError(AUTH_MESSAGES.AUTHENTICATION_REQUIRED, STATUS_CODE.UNAUTHORIZED);

        const result = await this.changePasswordUseCase.execute({ userId, ...req.body });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Password updated successfully" });
    });

    refreshToken = expressAsyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw new AppError("Refresh token is required", STATUS_CODE.UNAUTHORIZED);

        const result = await this.refreshTokenUseCase.execute(refreshToken);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.UNAUTHORIZED);

        const { accessToken, refreshToken: newRefreshToken } = result.getValue();
        this.setCookies(res, accessToken, newRefreshToken);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, accessToken, refreshToken: newRefreshToken });
    });

    resendOtp = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email, purpose } = req.body;
        const result = await this.resendOtpUseCase.execute({ email, purpose });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "OTP resent successfully" });
    });

    sendVerificationOtp = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError(AUTH_MESSAGES.AUTHENTICATION_REQUIRED, STATUS_CODE.UNAUTHORIZED);

        const result = await this.sendVerificationOtpUseCase.execute(userId);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Verification OTP sent successfully" });
    });

    forgotPassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) throw new AppError("Email is required", STATUS_CODE.BAD_REQUEST);

        const result = await this.forgotPasswordUseCase.execute({ email });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "If your email is registered, you will receive a password reset link." });
    });

    resetPassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const result = await this.resetPasswordUseCase.execute(req.body);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Password reset successfully" });
    });

    logout = expressAsyncHandler(async (req: Request, res: Response) => {
        this.removeCookies(res);
        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT_SUCCESSFULLY });
    });

    googleAuth = (req: Request, res: Response, next: any) => {
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false,
        })(req, res, next);
    };

    googleAuthCallback = expressAsyncHandler(async (req: Request, res: Response) => {
        passport.authenticate('google', { session: false }, async (err: any, user: any) => {
            if (err || !user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=Google authentication failed`);
            }

            const result = await this.loginWithGoogleUseCase.execute(user);
            if (result.isFailure) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(result.error!)}`);
            }

            const { accessToken, refreshToken } = result.getValue();
            this.setCookies(res, accessToken, refreshToken);

            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
        })(req, res);
    });

    updateAvatar = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        const { avatarKey } = req.body;
        if (!userId) throw new AppError(AUTH_MESSAGES.AUTHENTICATION_REQUIRED, STATUS_CODE.UNAUTHORIZED);
        if (!avatarKey) throw new AppError("Avatar key is required", STATUS_CODE.BAD_REQUEST);

        const result = await this.updateAvatarUseCase.execute({ userId, avatarKey });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Avatar updated successfully", data: { user: result.getValue() } });
    });
}
