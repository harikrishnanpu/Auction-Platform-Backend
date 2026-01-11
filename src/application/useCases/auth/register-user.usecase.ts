import { IUserRepository } from "../../../domain/user/user.repository";
import { IPasswordHasher, IJwtService } from "../../../domain/services/auth/auth.service";
import { IEmailService } from "../../../domain/services/email/email.service";
import { RegisterUserDto, UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { Password } from "../../../domain/user/password.vo";
import { User, UserRole } from "../../../domain/user/user.entity";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";

export class RegisterUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private jwtService: IJwtService,
        private emailService: IEmailService,
        private otpRepository: IOTPRepository
    ) { }

    public async execute(dto: RegisterUserDto): Promise<Result<UserResponseDto>> {
        const emailResult = Email.create(dto.email);
        const passwordValidation = Password.validateRaw(dto.password);

        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        if (passwordValidation.isFailure) return Result.fail(passwordValidation.error as string);

        const email = emailResult.getValue();

        const exists = await this.userRepository.emailExists(email);
        if (exists) {
            return Result.fail("User already exists with this email");
        }

        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const passwordOrError = Password.create(hashedPassword);

        if (passwordOrError.isFailure) return Result.fail(passwordOrError.error as string);

        const userOrError = User.create({
            name: dto.name,
            email: email,
            phone: dto.phone,
            address: dto.address,
            avatar_url: dto.avatar_url,
            password: passwordOrError.getValue(),
            roles: [UserRole.USER],
            is_verified: false,
            is_active: true
        });

        if (userOrError.isFailure) return Result.fail(userOrError.error as string);

        const user = userOrError.getValue();
        await this.userRepository.save(user);

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: otpCode, // Should be hashed
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        // Send Email
        await this.emailService.sendOtpEmail(user.email.value, otpCode);

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles
        });
    }
}
