"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class RefreshTokenUseCase {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async execute(refreshToken) {
        if (!refreshToken) {
            return result_1.Result.fail("Refresh token is required");
        }
        const decoded = this.jwtService.verifyRefresh(refreshToken);
        if (!decoded || !decoded.userId) {
            return result_1.Result.fail("Invalid or expired refresh token");
        }
        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        // Generate New Tokens (Rotation)
        const newAccessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
        const newRefreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
