"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
const email_vo_1 = require("../../../domain/user/email.vo");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FRONTEND_URL = process.env.FRONTEND_URL;
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
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        const resetToken = this.resetTokenService.generateToken(32);
        this.logger.info("Reset Password Token Generated");
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id.toString(),
            otp: resetToken,
            purpose: otp_entity_1.OtpPurpose.RESET_PASSWORD,
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
            status: otp_entity_1.OtpStatus.PENDING
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        const resetLink = `${FRONTEND_URL}/reset/password/change?token=${resetToken}&email=${encodeURIComponent(user.email.value)}`;
        this.logger.info(`resetLink: ${resetLink}`);
        await this.emailService.sendPasswordResetEmail(user.email.value, resetLink);
        return result_1.Result.ok();
    }
}
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
