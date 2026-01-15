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
import { ILogger } from "@application/ports/logger.port";
import { IOtpService } from "@application/ports/otp.port";

export class RegisterUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private emailService: IEmailService,
        private otpService: IOtpService,
        private otpRepository: IOTPRepository,
        private logger: ILogger
    ) { }

    public async execute(dto: RegisterUserDto): Promise<Result<UserResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (dto.password) {
            
            const passwordValidation = Password.validate(dto.password);
            
            if (emailResult.isFailure) return Result.fail(emailResult.error as string);
            if (passwordValidation.isFailure) return Result.fail(passwordValidation.error as string);
        }

        const email = emailResult.getValue();

        const exists = await this.userRepository.emailExists(email);
        const phoneExists = await this.userRepository.phoneExists(dto.phone);
        if (exists || phoneExists) {
            return Result.fail("User already exists with this email or phone");
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
            is_blocked: false,
            is_active: true,
        });

        if (userOrError.isFailure) return Result.fail(userOrError.error as string);

        const user = userOrError.getValue();
        await this.userRepository.save(user);

        const otpCode = this.otpService.generateOtp();

        this.logger.info("OTP Code" + otpCode);


        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.props.email.value,
            otp_hash: otpCode,
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        await this.emailService.sendOtpEmail(user.props.email.value, otpCode);

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.props.name,
            email: user.props.email.value,
            roles: user.props.roles,
        });
    }
}
