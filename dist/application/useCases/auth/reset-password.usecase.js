"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const result_1 = require("@result/result");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
const password_vo_1 = require("@domain/value-objects/user/password.vo");
class ResetPasswordUseCase {
    constructor(userRepository, otpRepository, passwordHasher, logger) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordHasher = passwordHasher;
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
        const otpRecord = await this.otpRepository.findByIdAndPurpose(user.id, otp_entity_1.OtpPurpose.RESET_PASSWORD);
        if (!otpRecord)
            return result_1.Result.fail("Invalid or expired reset token");
        if (otpRecord.otp !== dto.token)
            return result_1.Result.fail("Invalid OTP");
        if (otpRecord.isExpired())
            return result_1.Result.fail("OTP expired");
        if (otpRecord.status !== otp_entity_1.OtpStatus.PENDING)
            return result_1.Result.fail("OTP already used");
        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);
        const hashedPassword = await this.passwordHasher.hash(dto.newPassword);
        const passwordResult = password_vo_1.Password.create(hashedPassword);
        if (passwordResult.isFailure)
            return result_1.Result.fail(passwordResult.error);
        user.changePassword(passwordResult.getValue());
        await this.userRepository.save(user);
        return result_1.Result.ok(undefined);
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
