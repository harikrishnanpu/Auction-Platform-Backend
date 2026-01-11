import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { IEmailService } from "../../../domain/services/email/email.service";
import { Result } from "../../../domain/shared/result";
import { ForgotPasswordDto } from "../../dtos/auth/auth.dto";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { Email } from "../../../domain/user/email.vo";
import crypto from 'crypto';

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
            // Security: Don't reveal user existence.
            return Result.ok<void>();
        }

        // 2. Generate new secure token (random bytes)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log("Reset Password Token Generated");

        // 3. Save Token (We store the token directly or a hash? Storing hash is better security)
        // For simplicity with the existing OTP structure which calls it 'otp_hash', we'll store it directly for now 
        // OR we can hash it if we want to be strict.
        // If we store it directly, `reset-password` usecase compares it directly. 
        // Given 'otp_hash' name, let's treat it as the stored secret.
        // Let's store it as is for now to match the existing string field, 
        // but typically one would hash it. 
        // Check `ResetPasswordUseCase`, it compares `otpRecord.otp_hash !== dto.otp`.
        // So validation expects equality.

        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: resetToken, // Storing the token itself as the hash for now. 
            purpose: OtpPurpose.RESET_PASSWORD,
            channel: OtpChannel.EMAIL,
            expires_at: tokenExpiresAt,
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        // 4. Send Email with Link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email.value)}`;

        await this.emailService.sendPasswordResetEmail(user.email.value, resetLink);

        return Result.ok<void>();
    }
}
