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

        // 2. Compare Password
        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.value);
        if (!isValidPassword) {
            return Result.fail("Invalid email or password");
        }

        // 3. Generate Token
        const token = this.jwtService.sign({ userId: user.id, role: user.role });

        // 4. Return DTO
        return Result.ok<UserResponseDto>({
            id: user.id,
            email: user.email.value,
            role: user.role,
            accessToken: token
        });
    }
}
