import { IUserRepository } from "../../../domain/user/user.repository";
import { IJwtService } from "../../../domain/services/auth/auth.service";
import { Result } from "../../../domain/shared/result";
import { UserResponseDto } from "../../dtos/auth/auth.dto";

export class RefreshTokenUseCase {
    constructor(
        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ) { }

    public async execute(refreshToken: string): Promise<Result<UserResponseDto>> {
        if (!refreshToken) {
            return Result.fail("Refresh token is required");
        }

        const decoded = this.jwtService.verifyRefresh(refreshToken);
        if (!decoded || !decoded.userId) {
            return Result.fail("Invalid or expired refresh token");
        }

        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
            return Result.fail("User not found");
        }

        // Generate New Tokens (Rotation)
        const newAccessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
        const newRefreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
}
