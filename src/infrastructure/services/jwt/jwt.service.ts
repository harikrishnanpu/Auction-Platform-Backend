import { ITokenService, TokenPayload } from '@application/services/token/auth.token.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export class TokenService implements ITokenService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExpiry: string;
    private readonly refreshTokenExpiry: string;

    constructor() {

        if (!process.env.JWT_SECRET_ACCESS_TOKEN || !process.env.JWT_SECRET_REFRESH_TOKEN) {
            throw new Error('JWT secrets not found');
        }

        this.accessTokenSecret = process.env.JWT_SECRET_ACCESS_TOKEN;
        this.refreshTokenSecret = process.env.JWT_SECRET_REFRESH_TOKEN;
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }

    public generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry as any,
        });

        const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry as any,
        });

        return { accessToken, refreshToken };
    }

    public verifyAccessToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    public verifyRefreshToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
        } catch (error) {
            return null;
        }
    }
}

export const tokenService = new TokenService();
