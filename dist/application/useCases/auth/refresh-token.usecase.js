"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const result_1 = require("@result/result");
class RefreshTokenUseCase {
    constructor(userRepository, tokenService, logger) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.logger = logger;
    }
    async execute(refreshToken) {
        if (!refreshToken) {
            return result_1.Result.fail("Refresh token is required");
        }
        const decoded = this.tokenService.verifyRefreshToken(refreshToken);
        if (!decoded || !decoded.userId) {
            return result_1.Result.fail("Invalid or expired refresh token");
        }
        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        const payload = {
            userId: user.id,
            email: user.email.getValue(),
            roles: user.roles
        };
        const tokens = this.tokenService.generateTokens(payload);
        return result_1.Result.ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
