import { IUserRepository } from "@domain/repositories/user.repository";
import { IOTPRepository } from "@domain/entities/otp/otp.repository";
import { IEmailService } from "@application/services/email/email.service";
import { Result } from "@result/result";
import { ResendOtpDto } from "@application/dtos/auth/auth.dto";
import { OTP, OtpChannel, OtpPurpose } from "@domain/entities/otp/otp.entity";
import { Email } from "@domain/value-objects/user/email.vo";
import { ILogger } from "@application/ports/logger.port";
import { IOtpService } from "@application/ports/otp.port";
import { IUseCase } from "@application/interfaces/use-case.interface";
import { IResendOtpUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";

export class ResendOtpUseCase implements IResendOtpUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private emailService: IEmailService,
        private otpService: IOtpService,
        private logger: ILogger
    ) { }

    public async execute(dto: ResendOtpDto): Promise<Result<void>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error!);
        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");

        if (user.is_verified && dto.purpose === OtpPurpose.REGISTER) {
            return Result.fail("User is already verified");
        }

        const otpCode = this.otpService.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        this.logger.info(`OTP Code for ${user.email.getValue()}: ${otpCode}`);

        const otpResult = OTP.create({
            user_id: user.id!,
            otp: otpCode,
            purpose: dto.purpose as OtpPurpose || OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error!);
        await this.otpRepository.save(otpResult.getValue());

        await this.emailService.sendOtpEmail(user.email.getValue(), otpCode);

        return Result.ok<void>(undefined as any);
    }
}
