import { IUserRepository } from "../../../domain/user/user.repository";
import { IPasswordHasher } from "../../../domain/services/auth/auth.service";
import { RegisterUserDto, UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { Password } from "../../../domain/user/password.vo";
import { User, UserRole } from "../../../domain/user/user.entity";

export class RegisterUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher
    ) { }

    public async execute(dto: RegisterUserDto): Promise<Result<UserResponseDto>> {
        // 1. Create VOs to validate input
        const emailResult = Email.create(dto.email);
        const passwordValidation = Password.validateRaw(dto.password); // Domain rule check

        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        if (passwordValidation.isFailure) return Result.fail(passwordValidation.error as string);

        const email = emailResult.getValue();

        // 2. Check if user exists
        const exists = await this.userRepository.emailExists(email);
        if (exists) {
            return Result.fail("User already exists with this email");
        }

        // 3. Hash password (Application service)
        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const passwordOrError = Password.create(hashedPassword); // Create VO with hash (implicit trust since we just hashed it)

        if (passwordOrError.isFailure) return Result.fail(passwordOrError.error as string);

        // 4. Create User Entity
        const userOrError = User.create({
            email: email,
            password: passwordOrError.getValue(),
            role: UserRole.USER,
        });

        if (userOrError.isFailure) return Result.fail(userOrError.error as string);

        const user = userOrError.getValue();

        // 5. Save to Repo
        await this.userRepository.save(user);

        // 6. Return DTO
        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            email: user.email.value,
            role: user.role
        });
    }
}
