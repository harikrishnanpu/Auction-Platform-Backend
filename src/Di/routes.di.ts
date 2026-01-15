import { LoginUserUseCase } from "../application/useCases/auth/login-user.usecase";
import { RegisterUserUseCase } from "../application/useCases/auth/register-user.usecase";
import { VerifyEmailUseCase } from "../application/useCases/auth/verify-email.usecase";
import { ResendOtpUseCase } from "../application/useCases/auth/resend-otp.usecase";
import { RefreshTokenUseCase } from "../application/useCases/auth/refresh-token.usecase";
import { GetProfileUseCase } from "../application/useCases/user/get-profile.usecase";
import { LoginWithGoogleUseCase } from "../application/useCases/auth/login-google.usecase";
import { ForgotPasswordUseCase } from "../application/useCases/auth/forgot-password.usecase";
import { ResetPasswordUseCase } from "../application/useCases/auth/reset-password.usecase";
import { UserAuthController } from "../presentation/controllers/user.auth.controller";
import { AuthRoutes } from "../presentation/routes/auth.routes";
import { userRepository, otpRepository } from "./repository.di";
import { tokenService, emailService, loggerService, tokenGeneratorService, otpService, passwordHasher, storageService } from "./services.di";

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
import { GetAdminStatsUseCase } from "../application/useCases/admin/get-admin-stats.usecase";
import { AdminRoutes } from "../presentation/routes/admin.routes";
import { AdminAuthController } from "../presentation/controllers/admin-auth.controller";
import { AdminController } from "../presentation/controllers/admin.controller";

import { GenerateUploadUrlUseCase } from "../application/useCases/kyc/generate-upload-url.usecase";
import { CompleteKycUploadUseCase } from "../application/useCases/kyc/complete-kyc-upload.usecase";
import { GetKycStatusUseCase } from "../application/useCases/kyc/get-kyc-status.usecase";
import { SubmitKycUseCase } from "../application/useCases/kyc/submit-kyc.usecase";
import { KycController } from "../presentation/controllers/kyc.controller";
import { KycRoutes } from "../presentation/routes/kyc.routes";




const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
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
    tokenService,
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
    tokenService,
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

// Admin Use Cases
const getUsersUseCase = new GetUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const loginAdminUseCase = new LoginAdminUseCase(userRepository, passwordHasher, tokenService);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const blockUserUseCase = new BlockUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const getSellersUseCase = new GetSellersUseCase(userRepository);
const getSellerByIdUseCase = new GetSellerByIdUseCase(userRepository);
const verifySellerKycUseCase = new VerifySellerKycUseCase(userRepository);
const assignSellerRoleUseCase = new AssignSellerRoleUseCase(userRepository);
const getAdminStatsUseCase = new GetAdminStatsUseCase();

// KYC Use Cases
const generateUploadUrlUseCase = new GenerateUploadUrlUseCase(storageService);
const completeKycUploadUseCase = new CompleteKycUploadUseCase(userRepository);
const getKycStatusUseCase = new GetKycStatusUseCase(userRepository);
const submitKycUseCase = new SubmitKycUseCase(userRepository);

// Controllers
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

const adminController = new AdminController(
    getUsersUseCase,
    getUserByIdUseCase,
    updateUserUseCase,
    blockUserUseCase,
    deleteUserUseCase,
    getSellersUseCase,
    getSellerByIdUseCase,
    verifySellerKycUseCase,
    assignSellerRoleUseCase,
    getAdminStatsUseCase
);

const kycController = new KycController(
    generateUploadUrlUseCase,
    completeKycUploadUseCase,
    getKycStatusUseCase,
    submitKycUseCase
);

// Routes
export const authRoutes = new AuthRoutes(authController);
export const adminRoutes = new AdminRoutes(adminAuthController, adminController);
export const kycRoutes = new KycRoutes(kycController);
