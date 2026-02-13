import { CompleteProfileUseCase } from "@application/useCases/auth/complete-profile.usecase";
import { ForgotPasswordUseCase } from "@application/useCases/auth/forgot-password.usecase";
import { LoginGoogleUseCase } from "@application/useCases/auth/login-google.usecase";
import { LoginUserUseCase } from "@application/useCases/auth/login-user.usecase";
import { RefreshTokenUseCase } from "@application/useCases/auth/refresh-token.usecase";
import { RegisterUserUseCase } from "@application/useCases/auth/register-user.usecase";
import { ResendOtpUseCase } from "@application/useCases/auth/resend-otp.usecase";
import { ResetPasswordUseCase } from "@application/useCases/auth/reset-password.usecase";
import { SendVerificationOtpUseCase } from "@application/useCases/auth/send-verification-otp.usecase";
import { VerifyEmailUseCase } from "@application/useCases/auth/verify-email.usecase";
import { ChangePasswordUseCase } from "@application/useCases/user/change-password.usecase";
import { GetProfileUseCase } from "@application/useCases/user/get-profile.usecase";
import { UpdateAvatarUseCase } from "@application/useCases/user/update-avatar.usecase";
import { UpdateProfileUseCase } from "@application/useCases/user/update-profile.usecase";
import { AuthControllerFactory } from "@presentation/http/factories/auth.controller.factory";
import { otpRepository, userRepository } from "Di/repository.di";
import { emailService, loggerService, otpService, passwordHasher, resentTokenService, storageService, tokenService } from "Di/services.di";




const registerUseCase = new RegisterUserUseCase(userRepository, passwordHasher, emailService, otpService, otpRepository, loggerService)
const loginUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService, loggerService);
const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, otpRepository, tokenService, loggerService)
const resendOtpUseCase = new ResendOtpUseCase(userRepository, otpRepository, emailService, otpService, loggerService);
const completeProfileUseCase = new CompleteProfileUseCase(userRepository, loggerService);
const loginGoogleUseCase = new LoginGoogleUseCase(userRepository, tokenService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpRepository, emailService, loggerService, resentTokenService);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpRepository, passwordHasher, loggerService);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService, loggerService);
const getProfileUseCase = new GetProfileUseCase(userRepository, storageService);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository,);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository, otpRepository, passwordHasher);
const updateAvatarUseCase = new UpdateAvatarUseCase(userRepository, storageService);
const sendVerificationOtpUseCase = new SendVerificationOtpUseCase(userRepository, otpRepository, emailService, otpService, loggerService)


export const authController = AuthControllerFactory.create(
    registerUseCase,
    loginUseCase,
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
)