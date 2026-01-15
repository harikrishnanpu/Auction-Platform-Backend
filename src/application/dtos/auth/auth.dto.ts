export interface RegisterUserDto {
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar_url?: string;
    password: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface VerifyEmailDto {
    email: string;
    otp: string;
}

export interface ResendOtpDto {
    email: string;
    purpose?: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    email: string;
    token: string;
    newPassword: string;
}

export interface UserResponseDto {
    id: string;
    name: string;
    email: string;
    roles: string[];
    is_active?: boolean;
    is_verified?: boolean;
    is_blocked?: boolean;
    phone?: string;
    address?: string;
    avatar_url?: string;
    created_at?: Date;
    updated_at?: Date;
    accessToken?: string;
    refreshToken?: string;
}
