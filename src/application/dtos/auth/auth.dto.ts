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

export interface UserResponseDto {
    id: string;
    name: string;
    email: string;
    roles: string[];
    accessToken?: string;
    refreshToken?: string;
}
