import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { Result } from "../../../domain/shared/result";
import { ResetPasswordDto } from "../../dtos/auth/auth.dto";
import { OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { Email } from "../../../domain/user/email.vo";
import { Password } from "../../../domain/user/password.vo";
import bcrypt from 'bcryptjs';

export class ResetPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository
    ) { }

    public async execute(dto: ResetPasswordDto): Promise<Result<void>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        const email = emailResult.getValue();

        // 1. Find User
        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");

        // 2. Verify OTP
        const otpRecord = await this.otpRepository.findLatestByIdentifierAndPurpose(
            user.email.value,
            OtpPurpose.RESET_PASSWORD
        );

        if (!otpRecord) {
            return Result.fail("Invalid or expired reset token");
        }

        if (otpRecord.otp_hash !== dto.otp) {
            // Increment attempts logic could go here
            return Result.fail("Invalid OTP");
        }

        if (otpRecord.isExpired()) {
            return Result.fail("OTP expired");
        }

        if (otpRecord.status !== OtpStatus.PENDING) {
            return Result.fail("OTP already used");
        }

        // 3. Mark OTP as Verified
        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);

        // 4. Hash and Update Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

        const passwordResult = Password.create(hashedPassword);
        if (passwordResult.isFailure) return Result.fail(passwordResult.error as string);

        user.changePassword(passwordResult.getValue());

        // 5. Save User
        await this.userRepository.save(user);

        return Result.ok<void>();
    }
}
