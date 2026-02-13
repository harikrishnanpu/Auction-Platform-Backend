"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtpUseCase = void 0;
const result_1 = require("@result/result");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
class ResendOtpUseCase {
    constructor(userRepository, otpRepository, emailService, otpService, logger) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.otpService = otpService;
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
        const otpCode = this.otpService.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.logger.info(`OTP Code for ${user.email.getValue()}: ${otpCode}`);
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id,
            otp: otpCode,
            purpose: dto.purpose || otp_entity_1.OtpPurpose.REGISTER,
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
exports.ResendOtpUseCase = ResendOtpUseCase;
