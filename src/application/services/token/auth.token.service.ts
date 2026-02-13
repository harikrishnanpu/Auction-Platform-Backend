import { UserRole } from "@domain/entities/user/user.entity";

export interface TokenPayload {
    userId: string;
    email: string;
    roles: UserRole[];
}

export interface ITokenService {
    generateTokens(payload: any): { accessToken: string; refreshToken: string };
    verifyAccessToken(token: string): TokenPayload | null;
    verifyRefreshToken(token: string): TokenPayload | null;
}
