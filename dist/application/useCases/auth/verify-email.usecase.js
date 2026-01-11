"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
class VerifyEmailUseCase {
    constructor(userRepository, jwtService, otpRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.otpRepository = otpRepository;
    }
    async execute(request) {
        try {
            const emailResult = email_vo_1.Email.create(request.email);
            if (emailResult.isFailure)
                return result_1.Result.fail("Invalid email");
            const email = emailResult.getValue();
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                return result_1.Result.fail("User not found");
            }
            // Check for OTP with Purpose REGISTER or EMAIL_VERIFY
            let otpRecord = await this.otpRepository.findByIdentifierAndPurpose(email.value, otp_entity_1.OtpPurpose.REGISTER);
            if (!otpRecord) {
                otpRecord = await this.otpRepository.findByIdentifierAndPurpose(email.value, otp_entity_1.OtpPurpose.VERIFY_EMAIL);
            }
            if (!otpRecord) {
                return result_1.Result.fail("No OTP found for this email");
            }
            if (otpRecord.status !== otp_entity_1.OtpStatus.PENDING) {
                return result_1.Result.fail("OTP is invalid or already used");
            }
            if (otpRecord.isExpired()) {
                return result_1.Result.fail("OTP has expired");
            }
            if (!otpRecord.verify(request.otp)) {
                otpRecord.incrementAttempts();
                await this.otpRepository.save(otpRecord);
                return result_1.Result.fail("Invalid OTP");
            }
            otpRecord.markVerified();
            await this.otpRepository.save(otpRecord);
            user.verify();
            await this.userRepository.save(user);
            // Generate Tokens for auto-login
            const accessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
            const refreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });
            return result_1.Result.ok({
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
        }
        catch (error) {
            return result_1.Result.fail("Verification failed");
        }
    }
}
exports.VerifyEmailUseCase = VerifyEmailUseCase;
