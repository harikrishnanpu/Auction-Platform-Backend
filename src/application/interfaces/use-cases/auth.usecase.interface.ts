import { Result } from "@result/result";
import {
    RegisterUserDto,
    UserResponseDto,
    LoginUserDto,
    LoginResponseDto,
    VerifyEmailDto,
    ResendOtpDto,
    ForgotPasswordDto,
    ResetPasswordDto
} from "@application/dtos/auth/auth.dto";
import { User } from "@domain/entities/user/user.entity";

export interface IRegisterUserUseCase {
    execute(dto: RegisterUserDto): Promise<Result<UserResponseDto>>;
}

export interface ILoginUserUseCase {
    execute(dto: LoginUserDto): Promise<Result<LoginResponseDto>>;
}

export interface IVerifyEmailUseCase {
    execute(dto: VerifyEmailDto): Promise<Result<LoginResponseDto>>;
}

export interface IResendOtpUseCase {
    execute(dto: ResendOtpDto): Promise<Result<void>>;
}

export interface ISendVerificationOtpUseCase {
    execute(userId: string): Promise<Result<void>>;
}

export interface IRefreshTokenUseCase {
    execute(refreshToken: string): Promise<Result<LoginResponseDto>>;
}

export interface ILoginGoogleUseCase {
    execute(user: any): Promise<Result<LoginResponseDto>>;
}

export interface IForgotPasswordUseCase {
    execute(dto: ForgotPasswordDto): Promise<Result<void>>;
}

export interface IResetPasswordUseCase {
    execute(dto: ResetPasswordDto): Promise<Result<void>>;
}
