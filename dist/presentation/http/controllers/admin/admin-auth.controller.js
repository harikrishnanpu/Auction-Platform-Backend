"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const auth_validator_1 = require("presentation/validators/auth.validator");
const status_code_1 = require("constants/status.code");
const app_error_1 = require("shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class AdminAuthController {
    constructor(loginAdminUseCase) {
        this.loginAdminUseCase = loginAdminUseCase;
        this.login = (0, express_async_handler_1.default)(async (req, res) => {
            const parseResult = auth_validator_1.loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                throw new app_error_1.AppError("Invalid input", status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            const dto = parseResult.data;
            const result = await this.loginAdminUseCase.execute(dto);
            if (result.isFailure) {
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.UNAUTHORIZED);
            }
            const user = result.getValue();
            this.setCookies(res, user.accessToken, user.refreshToken);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: "Admin login successful",
                admin: user
            });
        });
        this.logout = (0, express_async_handler_1.default)(async (req, res) => {
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Logged out successfully" });
        });
    }
    setCookies(res, accessToken, refreshToken) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });
    }
}
exports.AdminAuthController = AdminAuthController;
