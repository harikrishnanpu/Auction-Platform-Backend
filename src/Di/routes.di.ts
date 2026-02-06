import { LoginUserUseCase } from "../application/useCases/auth/login-user.usecase";
import { RegisterUserUseCase } from "../application/useCases/auth/register-user.usecase";
import { VerifyEmailUseCase } from "../application/useCases/auth/verify-email.usecase";
import { ResendOtpUseCase } from "../application/useCases/auth/resend-otp.usecase";
import { SendVerificationOtpUseCase } from "../application/useCases/auth/send-verification-otp.usecase";
import { RefreshTokenUseCase } from "../application/useCases/auth/refresh-token.usecase";
import { GetProfileUseCase } from "../application/useCases/user/get-profile.usecase";
import { CompleteProfileUseCase } from "../application/useCases/user/complete-profile.usecase";
import { LoginWithGoogleUseCase } from "../application/useCases/auth/login-google.usecase";
import { ForgotPasswordUseCase } from "../application/useCases/auth/forgot-password.usecase";
import { ResetPasswordUseCase } from "../application/useCases/auth/reset-password.usecase";
import { UserAuthController } from "../presentation/controllers/auth/auth.controller";
import { AuthRoutes } from "../presentation/routes/auth.routes";
import { userRepository, otpRepository, kycRepository, auctionRepository, bidRepository, participantRepository, activityRepository, chatMessageRepository, categoryRepository, conditionRepository, transactionManager, paymentRepository } from "./repository.di";
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
import { AdminAuthController } from "../presentation/controllers/other/admin-auth.controller";
import { AdminController } from "../presentation/controllers/other/admin.controller";

import { GenerateUploadUrlUseCase } from "../application/useCases/kyc/generate-upload-url.usecase";
import { CompleteKycUploadUseCase } from "../application/useCases/kyc/complete-kyc-upload.usecase";
import { GetKycStatusUseCase } from "../application/useCases/kyc/get-kyc-status.usecase";
import { SubmitKycUseCase } from "../application/useCases/kyc/submit-kyc.usecase";
import { KycController } from "../presentation/controllers/other/kyc.controller";
import { KycRoutes } from "../presentation/routes/kyc.routes";

import { GetActiveAuctionsUseCase } from "../application/useCases/auction/get-active-auctions.usecase";
import { GetAuctionByIdUseCase } from "../application/useCases/auction/get-auction-by-id.usecase";
import { AddAuctionAssetsUseCase } from "../application/useCases/auction/add-auction-assets.usecase";
import { EnterAuctionUseCase } from "../application/useCases/auction/enter-auction.usecase";
import { RevokeUserUseCase } from "../application/useCases/auction/revoke-user.usecase";
import { GetUpcomingAuctionsUseCase } from "../application/useCases/auction/get-upcoming-auctions.usecase";
import { GetAuctionCategoriesUseCase } from "../application/useCases/auction/get-auction-categories.usecase";
import { GetAuctionConditionsUseCase } from "../application/useCases/auction/get-auction-conditions.usecase";
import { AuctionController } from "../presentation/controllers/other/auction.controller";
import { AuctionRoutes } from "../presentation/routes/auction.routes";
import { CreateAuctionUseCase } from "../application/useCases/seller/create-auction.usecase";
import { GenerateAuctionUploadUrlUseCase } from "../application/useCases/seller/generate-auction-upload-url.usecase";
import { GetSellerAuctionsUseCase } from "../application/useCases/seller/get-seller-auctions.usecase"; // Ensure path
import { PublishAuctionUseCase } from "../application/useCases/seller/publish-auction.usecase";
import { UpdateAuctionUseCase } from "../application/useCases/seller/update-auction.usecase";
import { GetSellerAuctionByIdUseCase } from "../application/useCases/seller/get-seller-auction-by-id.usecase";
import { PauseAuctionUseCase } from "../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase as SellerEndAuctionUseCase } from "../application/useCases/seller/end-auction.usecase";
import { EndAuctionUseCase as AuctionEndAuctionUseCase } from "../application/useCases/auction/end-auction.usecase";
import { SellerAuctionController } from "../presentation/controllers/seller/auction.controller";
import { SellerRoutes } from "../presentation/routes/seller.routes";
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

const completeProfileUseCase = new CompleteProfileUseCase(
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

const sendVerificationOtpUseCase = new SendVerificationOtpUseCase(
    userRepository,
    otpRepository,
    emailService,
    otpService,
    loggerService
);

const getUsersUseCase = new GetUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const loginAdminUseCase = new LoginAdminUseCase(userRepository, passwordHasher, tokenService);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const blockUserUseCase = new BlockUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const getSellersUseCase = new GetSellersUseCase(userRepository);
const getSellerByIdUseCase = new GetSellerByIdUseCase(userRepository, kycRepository, storageService);
const verifySellerKycUseCase = new VerifySellerKycUseCase(userRepository, kycRepository);
const assignSellerRoleUseCase = new AssignSellerRoleUseCase(userRepository);
const getAdminStatsUseCase = new GetAdminStatsUseCase(userRepository, kycRepository);

const generateUploadUrlUseCase = new GenerateUploadUrlUseCase(storageService);
const completeKycUploadUseCase = new CompleteKycUploadUseCase(userRepository, kycRepository);
const getKycStatusUseCase = new GetKycStatusUseCase(userRepository, kycRepository);
const submitKycUseCase = new SubmitKycUseCase(userRepository, kycRepository);

const authController = new UserAuthController(
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    resendOtpUseCase,
    refreshTokenUseCase,
    getProfileUseCase,
    completeProfileUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    loginWithGoogleUseCase,
    sendVerificationOtpUseCase
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

const createAuctionUseCase = new CreateAuctionUseCase(auctionRepository);
const publishAuctionUseCase = new PublishAuctionUseCase(auctionRepository);
const updateAuctionUseCase = new UpdateAuctionUseCase(auctionRepository);
const pauseAuctionUseCase = new PauseAuctionUseCase(auctionRepository);
const auctionEndAuctionUseCase = new AuctionEndAuctionUseCase(auctionRepository, bidRepository, activityRepository, paymentRepository);
const resumeAuctionUseCase = new ResumeAuctionUseCase(auctionRepository, auctionEndAuctionUseCase);
const endAuctionUseCase = new SellerEndAuctionUseCase(auctionRepository);
const generateAuctionUploadUrlUseCase = new GenerateAuctionUploadUrlUseCase(storageService);
const getSellerAuctionsUseCase = new GetSellerAuctionsUseCase(auctionRepository, storageService);
const getSellerAuctionByIdUseCase = new GetSellerAuctionByIdUseCase(auctionRepository, storageService);

const sellerAuctionController = new SellerAuctionController(
    createAuctionUseCase,
    generateAuctionUploadUrlUseCase,
    getSellerAuctionsUseCase,
    publishAuctionUseCase,
    getSellerAuctionByIdUseCase,
    updateAuctionUseCase,
    pauseAuctionUseCase,
    resumeAuctionUseCase,
    endAuctionUseCase
);






const addAuctionAssetsUseCase = new AddAuctionAssetsUseCase(auctionRepository);
const enterAuctionUseCase = new EnterAuctionUseCase(auctionRepository, participantRepository, userRepository, activityRepository);
const revokeUserUseCase = new RevokeUserUseCase(auctionRepository, participantRepository, bidRepository, activityRepository, transactionManager);
const getActiveAuctionsUseCase = new GetActiveAuctionsUseCase(auctionRepository, storageService);
const getUpcomingAuctionsUseCase = new GetUpcomingAuctionsUseCase(auctionRepository, storageService);
const getAuctionByIdUseCase = new GetAuctionByIdUseCase(auctionRepository, storageService);
const getAuctionCategoriesUseCase = new GetAuctionCategoriesUseCase(categoryRepository);
const getAuctionConditionsUseCase = new GetAuctionConditionsUseCase(conditionRepository);
const auctionController = new AuctionController(
    createAuctionUseCase,
    addAuctionAssetsUseCase,
    publishAuctionUseCase,
    getActiveAuctionsUseCase,
    getUpcomingAuctionsUseCase,
    getAuctionByIdUseCase,
    enterAuctionUseCase,
    revokeUserUseCase,
    getAuctionCategoriesUseCase,
    getAuctionConditionsUseCase
);

export const authRoutes = new AuthRoutes(authController);
export const adminRoutes = new AdminRoutes(adminAuthController, adminController);
export const kycRoutes = new KycRoutes(kycController);
export const sellerRoutes = new SellerRoutes(sellerAuctionController);
export const auctionRoutes = new AuctionRoutes(auctionController);
