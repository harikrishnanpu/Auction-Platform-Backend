import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { IEmailService } from "../../services/email/email.service";
import { Result } from "../../../domain/shared/result";
import { ForgotPasswordDto } from "../../dtos/auth/auth.dto";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { Email } from "../../../domain/user/email.vo";
import { ILogger } from "@application/ports/logger.port";
import dotenv from 'dotenv';
import { IResetTokenService } from "@application/services/token/reset.token.service";
dotenv.config();



const FRONTEND_URL = process.env.FRONTEND_URL;
export class ForgotPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private emailService: IEmailService,
        private logger: ILogger,
        private resetTokenService: IResetTokenService,
    ) { }

    public async execute(dto: ForgotPasswordDto): Promise<Result<void>> {


        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            return Result.fail("User not found");
        }

        if(user.is_blocked || !user.is_active || !user.is_verified) {
            return Result.fail("User account not verified");
        }

        const resetToken = this.resetTokenService.generateToken(32);

        this.logger.info("Reset Password Token Generated");

        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: resetToken,
            purpose: OtpPurpose.RESET_PASSWORD,
            channel: OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);


        await this.otpRepository.save(otpResult.getValue());

        const resetLink = `${FRONTEND_URL}/reset/password/change?token=${resetToken}&email=${encodeURIComponent(user.email.value)}`;

        this.logger.info(`resetLink: ${resetLink}`);

        await this.emailService.sendPasswordResetEmail(user.email.value, resetLink);

        return Result.ok<void>();
    }
}
