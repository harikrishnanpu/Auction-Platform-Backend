export interface RegisterUserDto {
    email: string;
    password: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UserResponseDto {
    id: string;
    email: string;
    role: string;
    accessToken?: string;
}
