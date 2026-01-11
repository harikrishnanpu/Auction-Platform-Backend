import { IUserRepository } from "../../../domain/user/user.repository";
import { IPasswordHasher, IJwtService } from "../../../domain/services/auth/auth.service";
import { LoginUserDto, UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";

export class LoginUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private jwtService: IJwtService
    ) { }

    public async execute(dto: LoginUserDto): Promise<Result<UserResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);

        const email = emailResult.getValue();

        // 1. Find User
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return Result.fail("Invalid email or password");
        }

        // 2. Check Active/Blocked/Verified
        if (!user.is_active) {
            return Result.fail("Account is inactive");
        }
        if (user.is_blocked) {
            return Result.fail("Account is blocked");
        }
        if (!user.is_verified) {
            return Result.fail("Please verify your email address");
        }

        // 3. Compare Password
        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.value);
        if (!isValidPassword) {
            return Result.fail("Invalid email or password");
        }

        // 4. Generate Tokens
        const accessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
        const refreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });

        // 5. Return DTO
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
