"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const result_1 = require("@result/result");
const password_vo_1 = require("@domain/value-objects/user/password.vo");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
class ChangePasswordUseCase {
    constructor(userRepository, otpRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        if (request.newPassword !== request.confirmPassword) {
            return result_1.Result.fail("Passwords do not match");
        }
        const user = await this.userRepository.findById(request.userId);
        if (!user)
            return result_1.Result.fail("User not found");
        const otpRecord = await this.otpRepository.findByIdAndPurpose(request.userId, otp_entity_1.OtpPurpose.RESET_PASSWORD);
        if (!otpRecord)
            return result_1.Result.fail("OTP not found or expired");
        if (otpRecord.isExpired())
            return result_1.Result.fail("OTP expired");
        if (otpRecord.status !== otp_entity_1.OtpStatus.PENDING)
            return result_1.Result.fail("OTP already used or invalid");
        if (!otpRecord.verify(request.otp)) {
            otpRecord.incrementAttempts();
            await this.otpRepository.save(otpRecord);
            return result_1.Result.fail("Invalid OTP");
        }
        if (user.password) {
            if (!request.oldPassword)
                return result_1.Result.fail("Old password is required");
            const isValid = await this.passwordHasher.compare(request.oldPassword, user.password.getValue());
            if (!isValid)
                return result_1.Result.fail("Incorrect old password");
        }
        const hashedPassword = await this.passwordHasher.hash(request.newPassword);
        const passwordResult = password_vo_1.Password.create(hashedPassword);
        if (passwordResult.isFailure)
            return result_1.Result.fail(passwordResult.error);
        user.changePassword(passwordResult.getValue());
        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);
        await this.userRepository.save(user);
        return result_1.Result.ok(undefined);
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
