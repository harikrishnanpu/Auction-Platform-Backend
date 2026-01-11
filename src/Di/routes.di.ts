import { LoginUserUseCase } from "../application/useCases/auth/login-user.usecase";
import { RegisterUserUseCase } from "../application/useCases/auth/register-user.usecase";
import { VerifyEmailUseCase } from "../application/useCases/auth/verify-email.usecase";
import { ResendOtpUseCase } from "../application/useCases/auth/resend-otp.usecase";
import { RefreshTokenUseCase } from "../application/useCases/auth/refresh-token.usecase";
import { GetProfileUseCase } from "../application/useCases/user/get-profile.usecase"; // Added this
import { ForgotPasswordUseCase } from "../application/useCases/auth/forgot-password.usecase";
import { ResetPasswordUseCase } from "../application/useCases/auth/reset-password.usecase";
import { UserAuthController } from "../presentation/controllers/user.auth.controller";
import { AuthRoutes } from "../presentation/routes/auth.routes";
import { userRepository, otpRepository } from "./repository.di";
import { jwtService, emailService } from "./services.di";

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
import { AdminController } from "../presentation/controllers/admin.controller";
import { AdminRoutes } from "../presentation/routes/admin.routes";
import { AdminAuthController } from "../presentation/controllers/admin-auth.controller";
import { adminJwtService, passwordHasher, storageService } from "./services.di";
import { GenerateUploadUrlUseCase } from "../application/useCases/kyc/generate-upload-url.usecase";
import { CompleteKycUploadUseCase } from "../application/useCases/kyc/complete-kyc-upload.usecase";
import { KycController } from "../presentation/controllers/kyc.controller";
import { KycRoutes } from "../presentation/routes/kyc.routes";

const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    jwtService
);

const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
    jwtService,
    emailService,
    otpRepository
);

const verifyEmailUseCase = new VerifyEmailUseCase(
    userRepository,
    otpRepository,
    jwtService
);

const resendOtpUseCase = new ResendOtpUseCase(
    userRepository,
    otpRepository,
    emailService
);

const refreshTokenUseCase = new RefreshTokenUseCase(
    userRepository,
    jwtService
);

const getProfileUseCase = new GetProfileUseCase(
    userRepository
);

const forgotPasswordUseCase = new ForgotPasswordUseCase(
    userRepository,
    otpRepository,
    emailService
);

const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    otpRepository
);

// Admin Use Cases
const getUsersUseCase = new GetUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const loginAdminUseCase = new LoginAdminUseCase(userRepository, passwordHasher, adminJwtService);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const blockUserUseCase = new BlockUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const getSellersUseCase = new GetSellersUseCase(userRepository);
const getSellerByIdUseCase = new GetSellerByIdUseCase(userRepository);
const verifySellerKycUseCase = new VerifySellerKycUseCase(userRepository);
const assignSellerRoleUseCase = new AssignSellerRoleUseCase(userRepository);

const authController = new UserAuthController(
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    resendOtpUseCase,
    refreshTokenUseCase,
    getProfileUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase
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
    assignSellerRoleUseCase
);

const adminAuthController = new AdminAuthController(
    loginAdminUseCase
);

import { GetKycStatusUseCase } from "../application/useCases/kyc/get-kyc-status.usecase";
import { SubmitKycUseCase } from "../application/useCases/kyc/submit-kyc.usecase";

// KYC Use Cases
const generateUploadUrlUseCase = new GenerateUploadUrlUseCase(storageService);
const completeKycUploadUseCase = new CompleteKycUploadUseCase(userRepository);
const getKycStatusUseCase = new GetKycStatusUseCase(userRepository);
const submitKycUseCase = new SubmitKycUseCase(userRepository);

const kycController = new KycController(
    generateUploadUrlUseCase,
    completeKycUploadUseCase,
    getKycStatusUseCase,
    submitKycUseCase
);

export const authRoutes = new AuthRoutes(authController);
export const adminRoutes = new AdminRoutes(adminController, adminAuthController);
export const kycRoutes = new KycRoutes(kycController);