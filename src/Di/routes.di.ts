import { LoginUserUseCase } from "../application/useCases/auth/login-user.usecase";
import { RegisterUserUseCase } from "../application/useCases/auth/register-user.usecase";
import { VerifyEmailUseCase } from "../application/useCases/auth/verify-email.usecase";
import { ResendOtpUseCase } from "../application/useCases/auth/resend-otp.usecase";
import { RefreshTokenUseCase } from "../application/useCases/auth/refresh-token.usecase";
import { GetProfileUseCase } from "../application/useCases/user/get-profile.usecase"; // Added this
import { UserAuthController } from "../presentation/controllers/user.auth.controller";
import { AuthRoutes } from "../presentation/routes/auth.routes";
import { userRepository, otpRepository } from "./repository.di";
import { jwtService, passwordHasher, emailService } from "./services.di";

import { GetUsersUseCase } from "../application/useCases/admin/get-users.usecase";
import { GetUserByIdUseCase } from "../application/useCases/admin/get-user-by-id.usecase";
import { AdminController } from "../presentation/controllers/admin.controller";
import { AdminRoutes } from "../presentation/routes/admin.routes";
import { AdminAuthController } from "../presentation/controllers/admin-auth.controller";

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

// Admin Use Cases
const getUsersUseCase = new GetUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

const authController = new UserAuthController(
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    resendOtpUseCase,
    refreshTokenUseCase,
    getProfileUseCase
);

const adminController = new AdminController(
    getUsersUseCase,
    getUserByIdUseCase
);


const adminAuthController = new AdminAuthController(
    loginUserUseCase
);

export const authRoutes = new AuthRoutes(authController);
export const adminRoutes = new AdminRoutes(adminController, adminAuthController);
