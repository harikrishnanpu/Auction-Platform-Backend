import { IUserRepository } from "../../../domain/user/user.repository";
import { IPasswordHasher } from "../../services/auth/auth.service";
import { LoginUserDto, UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { UserRole } from "../../../domain/user/user.entity";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";

export class LoginAdminUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private tokenService: ITokenService
    ) { }

    public async execute(dto: LoginUserDto): Promise<Result<UserResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);

        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return Result.fail("Invalid email or password");
        }

        if (!user.roles.includes(UserRole.ADMIN)) {
            return Result.fail("Access Denied: Admin privileges required.");
        }

        if (!user.password) {
            return Result.fail("Invalid email or password");
        }

        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.value);
        if (!isValidPassword) {
            return Result.fail("Invalid email or password");
        }

        const payload: TokenPayload = {
            userId: user.id.toString(),
            email: user.email.value,
            roles: user.roles
        }

        const tokens = this.tokenService.generateTokens(payload)

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            ...tokens
        });
    }
}
