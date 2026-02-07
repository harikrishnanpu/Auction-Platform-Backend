"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtpUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
const email_vo_1 = require("../../../domain/user/email.vo");
class ResendOtpUseCase {
    constructor(userRepository, otpRepository, emailService, logger) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.logger = logger;
    }
    async execute(dto) {
        const emailResult = email_vo_1.Email.create(dto.email);
        if (emailResult.isFailure)
            return result_1.Result.fail(emailResult.error);
        const email = emailResult.getValue();
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            return result_1.Result.fail("User not found");
        if (user.is_verified && dto.purpose === otp_entity_1.OtpPurpose.REGISTER) {
            return result_1.Result.fail("User is already verified");
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.logger.info("OTP Code: " + otpCode);
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id.toString(),
            otp: otpCode,
            purpose: dto.purpose || otp_entity_1.OtpPurpose.REGISTER,
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: otpExpiresAt,
            status: otp_entity_1.OtpStatus.PENDING
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        // 4. Send Email
        await this.emailService.sendOtpEmail(user.email.value, otpCode);
        return result_1.Result.ok();
    }
}
exports.ResendOtpUseCase = ResendOtpUseCase;
