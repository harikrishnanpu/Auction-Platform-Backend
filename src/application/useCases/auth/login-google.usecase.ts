import { User, UserRole } from "../../../domain/user/user.entity";
import { IUserRepository } from "../../../domain/user/user.repository";
import { TokenService, TokenPayload } from "../../services/token.service";
import { Email } from "../../../domain/user/email.vo";
import { Result } from "../../../domain/shared/result";

interface GoogleUserDto {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}

export class LoginWithGoogleUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: TokenService
    ) { }

    async execute(dto: GoogleUserDto): Promise<Result<{ accessToken: string; refreshToken: string; user: User }>> {
        try {
            let user = await this.userRepository.findByGoogleId(dto.googleId);

            if (!user) {
                const emailResult = Email.create(dto.email);
                if (emailResult.isFailure) {
                    return Result.fail(emailResult.error as string);
                }
                const email = emailResult.getValue();

                const existingUser = await this.userRepository.findByEmail(email);

                if (existingUser) {
                    return Result.fail("User with this email already exists. Please login with password.");
                }

                const userProps = {
                    name: dto.name,
                    email: email,
                    phone: undefined,
                    address: "Not Provided",
                    avatar_url: dto.avatar,
                    roles: [UserRole.USER],
                    is_active: true,
                    is_blocked: false,
                    is_verified: true,
                    created_at: new Date(),
                    googleId: dto.googleId,
                    password: undefined // Optional in modified entity
                };

                const userResult = User.create(userProps as any);
                if (userResult.isFailure) {
                    return Result.fail(userResult.error as string);
                }

                user = userResult.getValue();
                await this.userRepository.save(user);
            }

            if (user.props.is_blocked) {
                return Result.fail("User is blocked");
            }

            const payload: TokenPayload = {
                userId: user.id.toString(),
                email: user.props.email.value,
                roles: user.props.roles
            };

            const tokens = this.tokenService.generateTokens(payload);

            return Result.ok({ ...tokens, user });

        } catch (error) {
            console.error(error);
            return Result.fail("Internal server error during Google Login");
        }
    }
}
