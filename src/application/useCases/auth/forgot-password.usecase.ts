import { IUserRepository } from "@domain/repositories/user.repository";
import { IOTPRepository } from "@domain/entities/otp/otp.repository";
import { IEmailService } from "@application/services/email/email.service";
import { Result } from "@result/result";
import { ForgotPasswordDto } from "@application/dtos/auth/auth.dto";
import { OTP, OtpChannel, OtpPurpose } from "@domain/entities/otp/otp.entity";
import { Email } from "@domain/value-objects/user/email.vo";
import { ILogger } from "@application/ports/logger.port";
import { IResetTokenService } from "@application/services/token/reset.token.service";
import { IUseCase } from "@application/interfaces/use-case.interface";
import { IForgotPasswordUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";


export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private emailService: IEmailService,
        private logger: ILogger,
        private resetTokenService: IResetTokenService,
    ) { }

    public async execute(dto: ForgotPasswordDto): Promise<Result<void>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error!);
        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");

        const resetToken = this.resetTokenService.generateToken(32);
        this.logger.info("Reset Password Token Generated");

        const otpResult = OTP.create({
            user_id: user.id!,
            otp: resetToken,
            purpose: OtpPurpose.RESET_PASSWORD,
            channel: OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        if (otpResult.isFailure) return Result.fail(otpResult.error!);

        await this.otpRepository.save(otpResult.getValue());

        const resetLink = `${process.env.FRONTEND_URL}/reset/password/change?token=${resetToken}&email=${encodeURIComponent(user.email.getValue())}`;
        this.logger.info(`resetLink: ${resetLink}`);

        await this.emailService.sendPasswordResetEmail(user.email.getValue(), resetLink);

        return Result.ok<void>(undefined as any);
    }
}
