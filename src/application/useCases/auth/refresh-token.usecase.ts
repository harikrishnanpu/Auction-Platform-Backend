import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { LoginResponseDto } from "@application/dtos/auth/auth.dto";
import { ILogger } from "@application/ports/logger.port";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";
import { IRefreshTokenUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService,
        private logger: ILogger
    ) { }

    public async execute(refreshToken: string): Promise<Result<LoginResponseDto>> {
        if (!refreshToken) {
            return Result.fail("Refresh token is required");
        }

        const decoded = this.tokenService.verifyRefreshToken(refreshToken);
        if (!decoded || !decoded.userId) {
            return Result.fail("Invalid or expired refresh token");
        }

        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
            return Result.fail("User not found");
        }

        const payload: TokenPayload = {
            userId: user.id!,
            email: user.email.getValue(),
            roles: user.roles
        }

        const tokens = this.tokenService.generateTokens(payload);

        return Result.ok<LoginResponseDto>({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
}
