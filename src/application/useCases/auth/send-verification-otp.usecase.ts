import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { IEmailService } from "../../services/email/email.service";
import { Result } from "../../../domain/shared/result";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { ILogger } from "@application/ports/logger.port";
import { IOtpService } from "@application/ports/otp.port";

export class SendVerificationOtpUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private emailService: IEmailService,
        private otpService: IOtpService,
        private logger: ILogger
    ) { }

    public async execute(userId: string): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        if (user.is_verified) {
            return Result.fail("User is already verified");
        }

        const otpCode = this.otpService.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        this.logger.info("OTP Code: " + otpCode);

        const otpResult = OTP.create({
            user_id: user.id.toString(),
            otp: otpCode,
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        await this.emailService.sendOtpEmail(user.email.value, otpCode);

        return Result.ok<void>();
    }
}
