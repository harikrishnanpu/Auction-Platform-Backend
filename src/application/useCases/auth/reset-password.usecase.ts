import { IUserRepository } from "@domain/repositories/user.repository";
import { IOTPRepository } from "@domain/entities/otp/otp.repository";
import { Result } from "@result/result";
import { ResetPasswordDto } from "@application/dtos/auth/auth.dto";
import { OtpPurpose, OtpStatus } from "@domain/entities/otp/otp.entity";
import { Email } from "@domain/value-objects/user/email.vo";
import { Password } from "@domain/value-objects/user/password.vo";
import { ILogger } from "@application/ports/logger.port";
import { IPasswordHasher } from "@application/services/auth/auth.service";
import { IResetPasswordUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";

export class ResetPasswordUseCase implements IResetPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private passwordHasher: IPasswordHasher,
        private logger: ILogger
    ) { }

    public async execute(dto: ResetPasswordDto): Promise<Result<void>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error!);
        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");

        const otpRecord = await this.otpRepository.findByIdAndPurpose(user.id!, OtpPurpose.RESET_PASSWORD);

        if (!otpRecord) return Result.fail("Invalid or expired reset token");
        if (otpRecord.otp !== dto.token) return Result.fail("Invalid OTP");
        if (otpRecord.isExpired()) return Result.fail("OTP expired");
        if (otpRecord.status !== OtpStatus.PENDING) return Result.fail("OTP already used");

        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);

        const hashedPassword = await this.passwordHasher.hash(dto.newPassword);
        const passwordResult = Password.create(hashedPassword);
        if (passwordResult.isFailure) return Result.fail(passwordResult.error!);

        user.changePassword(passwordResult.getValue());
        await this.userRepository.save(user);

        return Result.ok<void>(undefined as any);
    }
}
