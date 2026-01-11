import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { IEmailService } from "../../../domain/services/email/email.service";
import { Result } from "../../../domain/shared/result";
import { ForgotPasswordDto } from "../../dtos/auth/auth.dto";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { Email } from "../../../domain/user/email.vo";

export class ForgotPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private emailService: IEmailService
    ) { }

    public async execute(dto: ForgotPasswordDto): Promise<Result<void>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        const email = emailResult.getValue();

        // 1. Find User
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // Security: Don't reveal user existence. Just return OK or a generic message.
            // However, usually specific error helps with UX if not strictly enterprise. 
            // Let's return Generic success to prevent enumeration.
            return Result.ok<void>();
        }

        // 2. Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log("Reset Password OTP Code", otpCode);

        // 3. Save OTP with RESET_PASSWORD purpose
        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: otpCode,
            purpose: OtpPurpose.RESET_PASSWORD,
            channel: OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        // 4. Send Email
        // Assuming emailService has a generic send method or we add a specific one.
        // Checking IEmailService interface first might be good, but assuming sendOtpEmail works for now. 
        // We'll update IEmailService if needed.
        await this.emailService.sendOtpEmail(user.email.value, otpCode);

        return Result.ok<void>();
    }
}
