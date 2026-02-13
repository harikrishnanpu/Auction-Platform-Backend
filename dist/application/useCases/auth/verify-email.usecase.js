"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailUseCase = void 0;
const result_1 = require("@result/result");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
class VerifyEmailUseCase {
    constructor(userRepository, otpRepository, tokenService, logger) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.tokenService = tokenService;
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
        if (user.is_verified)
            return result_1.Result.fail("User is already verified");
        const otp = await this.otpRepository.findByIdAndPurpose(user.id, otp_entity_1.OtpPurpose.REGISTER);
        if (!otp)
            return result_1.Result.fail("OTP not found or expired");
        if (otp.status !== otp_entity_1.OtpStatus.PENDING)
            return result_1.Result.fail("OTP is invalid");
        if (otp.isExpired()) {
            otp.markAsExpired();
            await this.otpRepository.save(otp);
            return result_1.Result.fail("OTP has expired");
        }
        if (!otp.verify(dto.otp)) {
            otp.incrementAttempts();
            await this.otpRepository.save(otp);
            return result_1.Result.fail("Invalid OTP");
        }
        otp.markAsVerified();
        await this.otpRepository.save(otp);
        user.verify();
        await this.userRepository.save(user);
        const payload = {
            userId: user.id,
            email: user.email.getValue(),
            roles: user.roles
        };
        const tokens = this.tokenService.generateTokens(payload);
        return result_1.Result.ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_verified: user.is_verified,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
}
exports.VerifyEmailUseCase = VerifyEmailUseCase;
