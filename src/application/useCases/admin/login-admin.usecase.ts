import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@application/services/auth/auth.service";
import { LoginUserDto, LoginResponseDto } from "@application/dtos/auth/auth.dto";
import { Result } from "@result/result";
import { Email } from "@domain/value-objects/user/email.vo";
import { UserRole } from "@domain/entities/user/user.entity";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";
import { ILoginAdminUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class LoginAdminUseCase implements ILoginAdminUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private tokenService: ITokenService
    ) { }

    public async execute(dto: LoginUserDto): Promise<Result<LoginResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error!);

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

        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.getValue());
        if (!isValidPassword) {
            return Result.fail("Invalid email or password");
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
