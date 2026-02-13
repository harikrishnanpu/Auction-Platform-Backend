import { Result } from "@result/result";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";

export interface IGetProfileUseCase {
    execute(userId: string): Promise<Result<UserResponseDto>>;
}

export interface ICompleteProfileUseCase {
    execute(request: { userId: string; phone: string; address: string }): Promise<Result<any>>;
}

export interface IUpdateProfileUseCase {
    execute(request: { userId: string; name?: string; address?: string; phone?: string; avatar_url?: string }): Promise<Result<any>>;
}

export interface IUpdateAvatarUseCase {
    execute(request: { userId: string; avatarKey: string }): Promise<Result<any>>;
}

export interface IChangePasswordUseCase {
    execute(request: {
        userId: string;
        oldPassword?: string;
        newPassword: string;
        confirmPassword: string;
        otp: string
    }): Promise<Result<void>>;
}
