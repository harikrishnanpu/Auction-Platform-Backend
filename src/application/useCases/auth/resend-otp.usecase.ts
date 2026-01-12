import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { IEmailService } from "../../../domain/services/email/email.service";
import { Result } from "../../../domain/shared/result";
import { ResendOtpDto } from "../../dtos/auth/auth.dto";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { Email } from "../../../domain/user/email.vo";
import { ILogger } from "@application/ports/logger.port";

export class ResendOtpUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private emailService: IEmailService,
        private logger: ILogger
    
    ) { }

    public async execute(dto: ResendOtpDto): Promise<Result<void>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");

        if (user.is_verified && dto.purpose === OtpPurpose.REGISTER) {
            return Result.fail("User is already verified");
        }


        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        this.logger.info("OTP Code: " + otpCode);

        const otpResult = OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: otpCode,
            purpose: dto.purpose as OtpPurpose || OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: OtpStatus.PENDING
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error as string);
        await this.otpRepository.save(otpResult.getValue());

        // 4. Send Email
        await this.emailService.sendOtpEmail(user.email.value, otpCode);

        return Result.ok<void>();
    }
}
