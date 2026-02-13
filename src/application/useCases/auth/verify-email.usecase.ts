import { IOTPRepository } from "@domain/entities/otp/otp.repository";
import { Result } from "@result/result";
import { VerifyEmailDto, LoginResponseDto } from "@application/dtos/auth/auth.dto";
import { OtpPurpose, OtpStatus } from "@domain/entities/otp/otp.entity";
import { Email } from "@domain/value-objects/user/email.vo";
import { ILogger } from "@application/ports/logger.port";
import { IUserRepository } from "@domain/repositories/user.repository";
import { ITokenService, TokenPayload } from "@application/services/token/auth.token.service";
import { IVerifyEmailUseCase } from "@application/interfaces/use-cases/auth.usecase.interface";

export class VerifyEmailUseCase implements IVerifyEmailUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private tokenService: ITokenService,
        private logger: ILogger
    ) { }

    public async execute(dto: VerifyEmailDto): Promise<Result<LoginResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error!);
        const email = emailResult.getValue();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");
        if (user.is_verified) return Result.fail("User is already verified");

        const otp = await this.otpRepository.findByIdAndPurpose(user.id!, OtpPurpose.REGISTER);
        if (!otp) return Result.fail("OTP not found or expired");
        if (otp.status !== OtpStatus.PENDING) return Result.fail("OTP is invalid");

        if (otp.isExpired()) {
            otp.markAsExpired();
            await this.otpRepository.save(otp);
            return Result.fail("OTP has expired");
        }

        if (!otp.verify(dto.otp)) {
            otp.incrementAttempts();
            await this.otpRepository.save(otp);
            return Result.fail("Invalid OTP");
        }

        otp.markAsVerified();
        await this.otpRepository.save(otp);

        user.verify();
        await this.userRepository.save(user);

        const payload: TokenPayload = {
            userId: user.id!,
            email: user.email.getValue(),
            roles: user.roles
        }

        const tokens = this.tokenService.generateTokens(payload);

        return Result.ok<LoginResponseDto>({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_verified: user.is_verified,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
}
