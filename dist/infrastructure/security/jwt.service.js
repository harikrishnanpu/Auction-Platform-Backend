"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtServiceImpl = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class JwtServiceImpl {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'default_secret_please_change';
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_please_change';
        this.expiresIn = '15m'; // Short-lived access token
        this.refreshExpiresIn = '7d'; // Long-lived refresh token
    }
    sign(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }
    signRefresh(payload) {
        return jsonwebtoken_1.default.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
    }
    verify(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secret);
        }
        catch (e) {
            return null;
        }
    }
    verifyRefresh(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshSecret);
        }
        catch (e) {
            return null;
        }
    }
}
exports.JwtServiceImpl = JwtServiceImpl;
