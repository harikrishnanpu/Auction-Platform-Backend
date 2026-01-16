import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import { ILogger } from "@application/ports/logger.port";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";
import { UserId } from "../../../domain/user/user-id.vo";

export class RefreshTokenUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService,
        private logger: ILogger

    ) { }

    public async execute(refreshToken: string): Promise<Result<UserResponseDto>> {
        if (!refreshToken) {
            return Result.fail("Refresh token is required");
        }

        const decoded = this.tokenService.verifyRefreshToken(refreshToken);
        if (!decoded || !decoded.userId) {
            return Result.fail("Invalid or expired refresh token");
        }

        const userId = UserId.create(decoded.userId);

        if (userId.isFailure) {
            return Result.fail('Invalid User ID');
        }

        const user = await this.userRepository.findById(userId.getValue());

        if (!user) {
            return Result.fail("User not found");
        }

        const payload: TokenPayload =
        {
            userId: user.id.toString(),
            email: user.email.value,
            roles: user.roles
        }

        const tokens = this.tokenService.generateTokens(payload);

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            ...tokens
        });
    }
}
