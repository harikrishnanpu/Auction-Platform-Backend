import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@application/services/auth/auth.service";
import { IEmailService } from "@application/services/email/email.service";
import { RegisterUserDto, UserResponseDto } from "@application/dtos/auth/auth.dto";
import { Result } from "@result/result";
import { Email } from "@domain/value-objects/user/email.vo";
import { Password } from "@domain/value-objects/user/password.vo";
import { User, UserRole } from "@domain/entities/user/user.entity";
import { IOTPRepository } from "@domain/entities/otp/otp.repository";
import { OTP, OtpChannel, OtpPurpose } from "@domain/entities/otp/otp.entity";
import { ILogger } from "@application/ports/logger.port";
import { IOtpService } from "@application/ports/otp.port";
import { AUTH_MESSAGES } from "../../../constants/auth.constants";
import { Phone } from "@domain/value-objects/user/phone.vo";
import { IRegisterUserUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";

export class RegisterUserUseCase implements IRegisterUserUseCase {
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
        if (emailResult.isFailure) return Result.fail(emailResult.error!);

        const phoneResult = Phone.create(dto.phone);
        if (phoneResult.isFailure) return Result.fail(phoneResult.error!);

        const email = emailResult.getValue();
        const phone = phoneResult.getValue();

        const [existingEmail, existingPhone] = await Promise.all([
            this.userRepository.findByEmail(email),
            this.userRepository.findByPhone(phone)
        ]);

        if (existingEmail || existingPhone) {
            return Result.fail(AUTH_MESSAGES.USER_ALREADY_EXISTS);
        }

        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const passwordOrError = Password.create(hashedPassword);
        if (passwordOrError.isFailure) return Result.fail(passwordOrError.error!);

        const userOrError = User.create({
            name: dto.name,
            email: email,
            phone: phone,
            address: dto.address,
            password: passwordOrError.getValue(),
            roles: [UserRole.USER],
            is_verified: false,
            is_profile_completed: true,
            is_blocked: false,
        });

        if (userOrError.isFailure) return Result.fail(userOrError.isFailure ? userOrError.error! : "Unknown error");
        const user = userOrError.getValue();

        await this.userRepository.save(user);

        const otpCode = this.otpService.generateOtp();
        this.logger.info(`OTP Code Generated for ${user.email.getValue()}: ${otpCode}`);

        const otpResult = OTP.create({
            user_id: user.id!,
            otp: otpCode,
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error!);

        await this.otpRepository.save(otpResult.getValue());
        await this.emailService.sendOtpEmail(user.email.getValue(), otpCode);

        return Result.ok<UserResponseDto>({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
        });
    }
}
