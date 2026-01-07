import { LoginUserUseCase } from "@application/useCases/auth/login-user.usecase";
import { RegisterUserUseCase } from "@application/useCases/auth/register-user.usecase";
import { AuthController } from "@presentation/controllers/auth.controller";
import { AuthRoutes } from "@presentation/routes/auth.routes";
import { userRepository } from "./repository.di";
import { jwtService, passwordHasher } from "./services.di";



const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    jwtService
);

const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher
);

const authController = new AuthController(
    registerUserUseCase,
    loginUserUseCase
);

export const authRoutes = new AuthRoutes(authController);

