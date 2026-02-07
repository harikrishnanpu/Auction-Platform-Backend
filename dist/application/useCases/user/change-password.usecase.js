"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const password_vo_1 = require("../../../domain/user/password.vo");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
class ChangePasswordUseCase {
    constructor(userRepository, otpRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(dto) {
        if (dto.newPassword !== dto.confirmPassword) {
            return result_1.Result.fail("Passwords do not match");
        }
        const user = await this.userRepository.findById(dto.userId);
        if (!user)
            return result_1.Result.fail("User not found");
        // Verify OTP
        const otpRecord = await this.otpRepository.findByIdAndPurpose(dto.userId, otp_entity_1.OtpPurpose.RESET_PASSWORD);
        if (!otpRecord) {
            return result_1.Result.fail("OTP not found or expired");
        }
        if (otpRecord.isExpired()) {
            return result_1.Result.fail("OTP expired");
        }
        if (otpRecord.status !== otp_entity_1.OtpStatus.PENDING) {
            return result_1.Result.fail("OTP already used or invalid");
        }
        if (!otpRecord.verify(dto.otp)) {
            otpRecord.incrementAttempts();
            await this.otpRepository.save(otpRecord);
            return result_1.Result.fail("Invalid OTP");
        }
        // If user has existing password, verify old password
        if (user.password) {
            if (!dto.oldPassword) {
                return result_1.Result.fail("Old password is required");
            }
            const isValid = await this.passwordHasher.compare(dto.oldPassword, user.password.value);
            if (!isValid) {
                return result_1.Result.fail("Incorrect old password");
            }
        }
        const validation = password_vo_1.Password.validate(dto.newPassword);
        if (validation.isFailure) {
            return result_1.Result.fail(validation.error);
        }
        const hashedPassword = await this.passwordHasher.hash(dto.newPassword);
        const passwordOrError = password_vo_1.Password.create(hashedPassword);
        if (passwordOrError.isFailure) {
            return result_1.Result.fail(passwordOrError.error);
        }
        user.changePassword(passwordOrError.getValue());
        // Mark OTP as verified
        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);
        await this.userRepository.save(user);
        return result_1.Result.ok();
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
