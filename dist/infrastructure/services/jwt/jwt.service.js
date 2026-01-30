"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    constructor() {
        if (!process.env.JWT_SECRET_ACCESS_TOKEN || !process.env.JWT_SECRET_REFRESH_TOKEN) {
            throw new Error('JWT secrets must be defined in environment variables');
        }
        this.accessTokenSecret = process.env.JWT_SECRET_ACCESS_TOKEN;
        this.refreshTokenSecret = process.env.JWT_SECRET_REFRESH_TOKEN;
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry,
        });
        return { accessToken, refreshToken };
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
        }
        catch (error) {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
        }
        catch (error) {
            return null;
        }
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
