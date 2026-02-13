"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordUseCase = void 0;
const result_1 = require("@result/result");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
class ForgotPasswordUseCase {
    constructor(userRepository, otpRepository, emailService, logger, resetTokenService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.logger = logger;
        this.resetTokenService = resetTokenService;
    }
    async execute(dto) {
        const emailResult = email_vo_1.Email.create(dto.email);
        if (emailResult.isFailure)
            return result_1.Result.fail(emailResult.error);
        const email = emailResult.getValue();
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            return result_1.Result.fail("User not found");
        const resetToken = this.resetTokenService.generateToken(32);
        this.logger.info("Reset Password Token Generated");
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id,
            otp: resetToken,
            purpose: otp_entity_1.OtpPurpose.RESET_PASSWORD,
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        const resetLink = `${process.env.FRONTEND_URL}/reset/password/change?token=${resetToken}&email=${encodeURIComponent(user.email.getValue())}`;
        this.logger.info(`resetLink: ${resetLink}`);
        await this.emailService.sendPasswordResetEmail(user.email.getValue(), resetLink);
        return result_1.Result.ok(undefined);
    }
}
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
