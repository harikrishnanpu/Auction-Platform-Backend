import { IUserRepository } from "../../../domain/user/user.repository";
import { IJwtService } from "../../../domain/services/auth/auth.service";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";

export class VerifyEmailUseCase {
    constructor(
        private userRepository: IUserRepository,
        private jwtService: IJwtService,
        private otpRepository: IOTPRepository
    ) { }

    public async execute(request: { email: string, otp: string }): Promise<Result<any>> {
        try {
            const emailResult = Email.create(request.email);
            if (emailResult.isFailure) return Result.fail("Invalid email");

            const email = emailResult.getValue();
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                return Result.fail("User not found");
            }

            // Check for OTP with Purpose REGISTER or EMAIL_VERIFY
            let otpRecord = await this.otpRepository.findByIdentifierAndPurpose(email.value, OtpPurpose.REGISTER);
            if (!otpRecord) {
                otpRecord = await this.otpRepository.findByIdentifierAndPurpose(email.value, OtpPurpose.VERIFY_EMAIL);
            }

            if (!otpRecord) {
                return Result.fail("No OTP found for this email");
            }

            if (otpRecord.status !== OtpStatus.PENDING) {
                return Result.fail("OTP is invalid or already used");
            }

            if (otpRecord.isExpired()) {
                return Result.fail("OTP has expired");
            }

            if (!otpRecord.verify(request.otp)) {
                otpRecord.incrementAttempts();
                await this.otpRepository.save(otpRecord);
                return Result.fail("Invalid OTP");
            }

            otpRecord.markVerified();
            await this.otpRepository.save(otpRecord);

            user.verify();
            await this.userRepository.save(user);

            // Generate Tokens for auto-login
            const accessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
            const refreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });

            return Result.ok({
                message: "Email verified successfully",
                user: {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email.value,
                    roles: user.roles,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            });
        } catch (error) {
            return Result.fail("Verification failed");
        }
    }
}
