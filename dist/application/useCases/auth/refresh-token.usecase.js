"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
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
        const userId = user_id_vo_1.UserId.create(decoded.userId);
        if (userId.isFailure) {
            return result_1.Result.fail('Invalid User ID');
        }
        const user = await this.userRepository.findById(userId.getValue());
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        const payload = {
            userId: user.id.toString(),
            email: user.email.value,
            roles: user.roles
        };
        const tokens = this.tokenService.generateTokens(payload);
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            ...tokens
        });
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
