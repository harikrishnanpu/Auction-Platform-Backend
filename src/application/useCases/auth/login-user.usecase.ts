import { IUserRepository } from "../../../domain/user/user.repository";
import { IPasswordHasher } from "../../services/auth/auth.service";
import { LoginUserDto, UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { ILogger } from "../../ports/logger.port";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";

export class LoginUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private tokenService: ITokenService,
        private logger: ILogger
    ) { }

    public async execute(dto: LoginUserDto): Promise<Result<UserResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);

        const email = emailResult.getValue();

        this.logger.info(`login for email: ${email.value}`);

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            return Result.fail("Invalid email or password");
        }

        if (user.props.is_blocked) {
            return Result.fail("Account is blocked");
        }
        if (!user.props.is_verified) {
            return Result.fail("Please verify your email address");
        }

        if (user.props.password) {
            const isValidPassword = await this.passwordHasher.compare(dto.password, user.props.password.value);

            if (!isValidPassword) {
                return Result.fail("Invalid email or password");
            }
        }

        const payload: TokenPayload = {
            userId: user.id.toString(),
            email: user.props.email.value,
            roles: user.props.roles
        }

        const tokens = this.tokenService.generateTokens(payload);

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.props.name,
            email: user.props.email.value,
            roles: user.props.roles,
            ...tokens
        });
    }
}
