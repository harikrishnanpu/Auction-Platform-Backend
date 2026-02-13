"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendVerificationOtpUseCase = void 0;
const result_1 = require("@result/result");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
class SendVerificationOtpUseCase {
    constructor(userRepository, otpRepository, emailService, otpService, logger) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.otpService = otpService;
        this.logger = logger;
    }
    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        if (user.is_verified) {
            return result_1.Result.fail("User is already verified");
        }
        const otpCode = this.otpService.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.logger.info(`Verification OTP Code for ${user.email.getValue()}: ${otpCode}`);
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id,
            otp: otpCode,
            purpose: otp_entity_1.OtpPurpose.REGISTER,
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        await this.emailService.sendOtpEmail(user.email.getValue(), otpCode);
        return result_1.Result.ok(undefined);
    }
}
exports.SendVerificationOtpUseCase = SendVerificationOtpUseCase;
