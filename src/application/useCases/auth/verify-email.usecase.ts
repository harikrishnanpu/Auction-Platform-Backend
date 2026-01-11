import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { Result } from "../../../domain/shared/result";
import { VerifyEmailDto } from "../../dtos/auth/auth.dto";
import { OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { IJwtService } from "../../../domain/services/auth/auth.service";
import { Email } from "../../../domain/user/email.vo";

import { UserResponseDto } from "../../dtos/auth/auth.dto";

export class VerifyEmailUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private jwtService: IJwtService
    ) { }

    public async execute(dto: VerifyEmailDto): Promise<Result<UserResponseDto>> {
        const emailResult = Email.create(dto.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error as string);
        const email = emailResult.getValue();

        // 1. Find User
        const user = await this.userRepository.findByEmail(email);
        if (!user) return Result.fail("User not found");

        if (user.is_verified) return Result.fail("User is already verified");

        // 2. Find OTP
        const otp = await this.otpRepository.findByIdentifierAndPurpose(email.value, OtpPurpose.REGISTER);

        // 3. Validate OTP
        if (!otp) return Result.fail("OTP not found or expired");

        if (otp.status !== OtpStatus.PENDING) return Result.fail("OTP is invalid");

        if (new Date() > otp.expires_at) {
            otp.markAsExpired();
            await this.otpRepository.save(otp);
            return Result.fail("OTP has expired");
        }

        if (otp.otp_hash !== dto.otp) { // Assuming plain text comparison for now based on register usecase
            otp.incrementAttempts();
            await this.otpRepository.save(otp);
            return Result.fail("Invalid OTP");
        }

        // 4. Mark OTP as Verified
        otp.markAsVerified();
        await this.otpRepository.save(otp);

        // 5. Activate User
        user.verify();
        await this.userRepository.save(user);

        // 6. Generate Tokens (Auto login)
        const accessToken = this.jwtService.sign({
            userId: user.id.toString(),
            email: user.email.value,
            role: user.roles[0]
        });

        const refreshToken = this.jwtService.sign({
            userId: user.id.toString(),
            email: user.email.value,
            role: user.roles[0]
        });

        return Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_verified: user.is_verified,
            accessToken,
            refreshToken
        });
    }
}
