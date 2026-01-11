"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtpUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
class ResendOtpUseCase {
    constructor(userRepository, emailService, otpRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.otpRepository = otpRepository;
    }
    async execute(emailStr) {
        const emailResult = email_vo_1.Email.create(emailStr);
        if (emailResult.isFailure)
            return result_1.Result.fail("Invalid email");
        const email = emailResult.getValue();
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        if (user.is_verified) {
            return result_1.Result.fail("User is already verified");
        }
        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id.toString(),
            identifier: user.email.value,
            otp_hash: otpCode, // Should be hashed
            purpose: otp_entity_1.OtpPurpose.REGISTER, // Or reuse original purpose? Default to Register/Verify Email
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: otp_entity_1.OtpStatus.PENDING
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        // Send Email
        await this.emailService.sendOtpEmail(user.email.value, otpCode);
        return result_1.Result.ok();
    }
}
exports.ResendOtpUseCase = ResendOtpUseCase;
