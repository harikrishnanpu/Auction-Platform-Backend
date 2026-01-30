"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
const password_vo_1 = require("../../../domain/user/password.vo");
const user_entity_1 = require("../../../domain/user/user.entity");
const otp_entity_1 = require("../../../domain/otp/otp.entity");
class RegisterUserUseCase {
    constructor(userRepository, passwordHasher, emailService, otpService, otpRepository, logger) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.emailService = emailService;
        this.otpService = otpService;
        this.otpRepository = otpRepository;
        this.logger = logger;
    }
    async execute(dto) {
        const emailResult = email_vo_1.Email.create(dto.email);
        if (dto.password) {
            const passwordValidation = password_vo_1.Password.validate(dto.password);
            if (emailResult.isFailure)
                return result_1.Result.fail(emailResult.error);
            if (passwordValidation.isFailure)
                return result_1.Result.fail(passwordValidation.error);
        }
        const email = emailResult.getValue();
        const exists = await this.userRepository.emailExists(email);
        const phoneExists = await this.userRepository.phoneExists(dto.phone);
        if (exists || phoneExists) {
            return result_1.Result.fail("User already exists with this email or phone");
        }
        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const passwordOrError = password_vo_1.Password.create(hashedPassword);
        if (passwordOrError.isFailure)
            return result_1.Result.fail(passwordOrError.error);
        const userOrError = user_entity_1.User.create({
            name: dto.name,
            email: email,
            phone: dto.phone,
            address: dto.address,
            avatar_url: dto.avatar_url,
            password: passwordOrError.getValue(),
            roles: [user_entity_1.UserRole.USER],
            is_verified: false,
            is_blocked: false,
            is_active: true,
        });
        if (userOrError.isFailure)
            return result_1.Result.fail(userOrError.error);
        const user = userOrError.getValue();
        await this.userRepository.save(user);
        const otpCode = this.otpService.generateOtp();
        this.logger.info("OTP Code" + otpCode);
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id.toString(),
            identifier: user.props.email.value,
            otp_hash: otpCode,
            purpose: otp_entity_1.OtpPurpose.REGISTER,
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
            status: otp_entity_1.OtpStatus.PENDING
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        await this.emailService.sendOtpEmail(user.props.email.value, otpCode);
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.props.name,
            email: user.props.email.value,
            roles: user.props.roles,
        });
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
