import { User, UserRole } from "@domain/entities/user/user.entity";
import { IUserRepository } from "@domain/repositories/user.repository";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";
import { Email } from "@domain/value-objects/user/email.vo";
import { Result } from "@result/result";
import { LoginResponseDto } from "@application/dtos/auth/auth.dto";
import { ILoginGoogleUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";

interface GoogleUserDto {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}

export class LoginGoogleUseCase implements ILoginGoogleUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService
    ) { }

    private mapToResponse(user: User, tokens: { accessToken: string; refreshToken: string }): LoginResponseDto {
        return {
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            is_verified: user.is_verified,
            is_blocked: user.is_blocked,
            is_profile_completed: user.is_profile_completed,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }

    async execute(dto: GoogleUserDto): Promise<Result<LoginResponseDto>> {
        try {
            let user = await this.userRepository.findByGoogleId(dto.googleId);

            if (!user) {
                const emailResult = Email.create(dto.email);
                if (emailResult.isFailure) return Result.fail(emailResult.error!);
                const email = emailResult.getValue();

                const existingUser = await this.userRepository.findByEmail(email);

                if (existingUser) {
                    const payload: TokenPayload = {
                        userId: existingUser.id!,
                        email: existingUser.email.getValue(),
                        roles: existingUser.roles
                    };
                    const tokens = this.tokenService.generateTokens(payload);
                    return Result.ok(this.mapToResponse(existingUser, tokens));
                }

                const userResult = User.create({
                    name: dto.name,
                    email: email,
                    address: "",
                    avatar_url: dto.avatar,
                    roles: [UserRole.USER],
                    is_blocked: false,
                    is_verified: true,
                    is_profile_completed: false,
                    googleId: dto.googleId,
                });

                if (userResult.isFailure) return Result.fail(userResult.error!);

                user = userResult.getValue();
                await this.userRepository.save(user);
            }

            if (user.is_blocked) return Result.fail("User is blocked");

            const payload: TokenPayload = {
                userId: user.id!,
                email: user.email.getValue(),
                roles: user.roles
            };

            const tokens = this.tokenService.generateTokens(payload);
            return Result.ok(this.mapToResponse(user, tokens));

        } catch (error) {
            console.error(error);
            return Result.fail("Internal server error during Google Login");
        }
    }
}
