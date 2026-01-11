import { IUserRepository } from "../../../domain/user/user.repository";
import { IEmailService } from "../../../domain/services/email/email.service";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";

export class ResendOtpUseCase {
    constructor(
        private userRepository: IUserRepository,
        private emailService: IEmailService,
        private otpRepository: IOTPRepository
    ) { }

    public async execute(emailStr: string): Promise<Result<void>> {
        const emailResult = Email.create(emailStr);
        if (emailResult.isFailure) return Result.fail("Invalid email");

        const email = emailResult.getValue();
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            return Result.fail("User not found");
        }

        if (user.is_verified) {
            return Result.fail("User is already verified");
        }

        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: otpCode, // Should be hashed
            purpose: OtpPurpose.REGISTER, // Or reuse original purpose? Default to Register/Verify Email
            channel: OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        // Send Email
        await this.emailService.sendOtpEmail(user.email.value, otpCode);

        return Result.ok<void>();
    }
}
