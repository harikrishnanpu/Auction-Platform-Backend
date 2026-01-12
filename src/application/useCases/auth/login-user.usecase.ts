import { IUserRepository } from "../../../domain/user/user.repository";
import { IPasswordHasher, IJwtService } from "../../../domain/services/auth/auth.service";
import { LoginUserDto, UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { ILogger } from "../../ports/logger.port";

export class LoginUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private jwtService: IJwtService,
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

        if (!user.is_active) {
            return Result.fail("Account is inactive");
        }
        if (user.is_blocked) {
            return Result.fail("Account is blocked");
        }
        if (!user.is_verified) {
            return Result.fail("Please verify your email address");
        }

        if (user.password) {   
            const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.value);
            
            if (!isValidPassword) {
                return Result.fail("Invalid email or password");
            }
        }


        const accessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
        const refreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
}
