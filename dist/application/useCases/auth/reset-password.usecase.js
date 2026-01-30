"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
const email_vo_1 = require("../../../domain/user/email.vo");
const password_vo_1 = require("../../../domain/user/password.vo");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class ResetPasswordUseCase {
    constructor(userRepository, otpRepository, logger) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
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
        const otpRecord = await this.otpRepository.findLatestByIdAndPurpose(user.email.value, otp_entity_1.OtpPurpose.RESET_PASSWORD);
        if (!otpRecord) {
            return result_1.Result.fail("Invalid or expired reset token");
        }
        if (otpRecord.otp_hash !== dto.token) {
            return result_1.Result.fail("Invalid OTP");
        }
        if (otpRecord.isExpired()) {
            return result_1.Result.fail("OTP expired");
        }
        if (otpRecord.status !== otp_entity_1.OtpStatus.PENDING) {
            return result_1.Result.fail("OTP already used");
        }
        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(dto.newPassword, salt);
        const passwordResult = password_vo_1.Password.create(hashedPassword);
        if (passwordResult.isFailure)
            return result_1.Result.fail(passwordResult.error);
        user.changePassword(passwordResult.getValue());
        await this.userRepository.save(user);
        return result_1.Result.ok();
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
