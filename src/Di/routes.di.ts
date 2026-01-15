import { LoginUserUseCase } from "../application/useCases/auth/login-user.usecase";
import { RegisterUserUseCase } from "../application/useCases/auth/register-user.usecase";
import { VerifyEmailUseCase } from "../application/useCases/auth/verify-email.usecase";
import { ResendOtpUseCase } from "../application/useCases/auth/resend-otp.usecase";
import { RefreshTokenUseCase } from "../application/useCases/auth/refresh-token.usecase";
import { GetProfileUseCase } from "../application/useCases/user/get-profile.usecase"; // Added this
import { LoginWithGoogleUseCase } from "../application/useCases/auth/login-google.usecase";
import { ForgotPasswordUseCase } from "../application/useCases/auth/forgot-password.usecase";
import { ResetPasswordUseCase } from "../application/useCases/auth/reset-password.usecase";
import { UserAuthController } from "../presentation/controllers/user.auth.controller";
import { AuthRoutes } from "../presentation/routes/auth.routes";
import { userRepository, otpRepository } from "./repository.di";
import { jwtService, emailService, loggerService, tokenGeneratorService, otpService } from "./services.di";
import { tokenService } from "../application/services/token.service";

import { GetUsersUseCase } from "../application/useCases/admin/get-users.usecase";
import { GetUserByIdUseCase } from "../application/useCases/admin/get-user-by-id.usecase";
import { LoginAdminUseCase } from "../application/useCases/admin/login-admin.usecase";
import { UpdateUserUseCase } from "../application/useCases/admin/update-user.usecase";
import { BlockUserUseCase } from "../application/useCases/admin/block-user.usecase";
import { DeleteUserUseCase } from "../application/useCases/admin/delete-user.usecase";
import { GetSellersUseCase } from "../application/useCases/admin/get-sellers.usecase";
import { GetSellerByIdUseCase } from "../application/useCases/admin/get-seller-by-id.usecase";
import { VerifySellerKycUseCase } from "../application/useCases/admin/verify-seller-kyc.usecase";
import { AssignSellerRoleUseCase } from "../application/useCases/admin/assign-seller-role.usecase";
import { AdminRoutes } from "../presentation/routes/admin.routes";
import { AdminAuthController } from "../presentation/controllers/admin-auth.controller";
import { adminJwtService, passwordHasher, storageService } from "./services.di";

const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    jwtService,
    loggerService
);

const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
    emailService,
    otpService,
    otpRepository,
    loggerService
);

const verifyEmailUseCase = new VerifyEmailUseCase(
    userRepository,
    otpRepository,
    jwtService,
    loggerService
);

const resendOtpUseCase = new ResendOtpUseCase(
    userRepository,
    otpRepository,
    emailService,
    loggerService
);

const refreshTokenUseCase = new RefreshTokenUseCase(
    userRepository,
    jwtService,
    loggerService
);

const getProfileUseCase = new GetProfileUseCase(
    userRepository
);



const forgotPasswordUseCase = new ForgotPasswordUseCase(
    userRepository,
    otpRepository,
    emailService,
    loggerService,
    tokenGeneratorService
);

const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    otpRepository,
    loggerService
);


const loginWithGoogleUseCase = new LoginWithGoogleUseCase(
    userRepository,
    tokenService
);

const loginAdminUseCase = new LoginAdminUseCase(userRepository, passwordHasher, adminJwtService);


const authController = new UserAuthController(
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    resendOtpUseCase,
    refreshTokenUseCase,
    getProfileUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    loginWithGoogleUseCase
);
const adminAuthController = new AdminAuthController(
    loginAdminUseCase
);

// import { GetKycStatusUseCase } from "../application/useCases/kyc/get-kyc-status.usecase";
// import { SubmitKycUseCase } from "../application/useCases/kyc/submit-kyc.usecase";

// const generateUploadUrlUseCase = new GenerateUploadUrlUseCase(storageService);
// const completeKycUploadUseCase = new CompleteKycUploadUseCase(userRepository);
// const getKycStatusUseCase = new GetKycStatusUseCase(userRepository);
// const submitKycUseCase = new SubmitKycUseCase(userRepository);



export const authRoutes = new AuthRoutes(authController);
export const adminRoutes = new AdminRoutes(adminAuthController);
