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
} from "application/interfaces/use-cases/auth.usecase.interface";
import {
    IGetProfileUseCase,
    ICompleteProfileUseCase,
    IUpdateProfileUseCase,
    IUpdateAvatarUseCase,
    IChangePasswordUseCase
} from "application/interfaces/use-cases/user.usecase.interface";
import { AuthController } from "../controllers/auth/auth.controller";

export class AuthControllerFactory {
    static create(
        registerUserUseCase: IRegisterUserUseCase,
        loginUserUseCase: ILoginUserUseCase,
        verifyEmailUseCase: IVerifyEmailUseCase,
        resendOtpUseCase: IResendOtpUseCase,
        refreshTokenUseCase: IRefreshTokenUseCase,
        getProfileUseCase: IGetProfileUseCase,
        completeProfileUseCase: ICompleteProfileUseCase,
        updateProfileUseCase: IUpdateProfileUseCase,
        updateAvatarUseCase: IUpdateAvatarUseCase,
        changePasswordUseCase: IChangePasswordUseCase,
        forgotPasswordUseCase: IForgotPasswordUseCase,
        resetPasswordUseCase: IResetPasswordUseCase,
        loginGoogleUseCase: ILoginGoogleUseCase,
        sendVerificationOtpUseCase: ISendVerificationOtpUseCase
    ): AuthController {
        return new AuthController(
            registerUserUseCase,
            loginUserUseCase,
            verifyEmailUseCase,
            resendOtpUseCase,
            refreshTokenUseCase,
            getProfileUseCase,
            completeProfileUseCase,
            updateProfileUseCase,
            updateAvatarUseCase,
            changePasswordUseCase,
            forgotPasswordUseCase,
            resetPasswordUseCase,
            loginGoogleUseCase,
            sendVerificationOtpUseCase
        );
    }
}