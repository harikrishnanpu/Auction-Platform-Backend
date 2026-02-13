"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const result_1 = require("@result/result");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
const password_vo_1 = require("@domain/value-objects/user/password.vo");
const user_entity_1 = require("@domain/entities/user/user.entity");
const otp_entity_1 = require("@domain/entities/otp/otp.entity");
const auth_constants_1 = require("../../../constants/auth.constants");
const phone_vo_1 = require("@domain/value-objects/user/phone.vo");
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
        if (emailResult.isFailure)
            return result_1.Result.fail(emailResult.error);
        const phoneResult = phone_vo_1.Phone.create(dto.phone);
        if (phoneResult.isFailure)
            return result_1.Result.fail(phoneResult.error);
        const email = emailResult.getValue();
        const phone = phoneResult.getValue();
        const [existingEmail, existingPhone] = await Promise.all([
            this.userRepository.findByEmail(email),
            this.userRepository.findByPhone(phone)
        ]);
        if (existingEmail || existingPhone) {
            return result_1.Result.fail(auth_constants_1.AUTH_MESSAGES.USER_ALREADY_EXISTS);
        }
        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const passwordOrError = password_vo_1.Password.create(hashedPassword);
        if (passwordOrError.isFailure)
            return result_1.Result.fail(passwordOrError.error);
        const userOrError = user_entity_1.User.create({
            name: dto.name,
            email: email,
            phone: phone,
            address: dto.address,
            password: passwordOrError.getValue(),
            roles: [user_entity_1.UserRole.USER],
            is_verified: false,
            is_profile_completed: true,
            is_blocked: false,
        });
        if (userOrError.isFailure)
            return result_1.Result.fail(userOrError.isFailure ? userOrError.error : "Unknown error");
        const user = userOrError.getValue();
        await this.userRepository.save(user);
        const otpCode = this.otpService.generateOtp();
        this.logger.info(`OTP Code Generated for ${user.email.getValue()}: ${otpCode}`);
        const otpResult = otp_entity_1.OTP.create({
            user_id: user.id,
            otp: otpCode,
            purpose: otp_entity_1.OtpPurpose.REGISTER,
            channel: otp_entity_1.OtpChannel.EMAIL,
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
        });
        if (otpResult.isFailure)
            return result_1.Result.fail(otpResult.error);
        await this.otpRepository.save(otpResult.getValue());
        await this.emailService.sendOtpEmail(user.email.getValue(), otpCode);
        return result_1.Result.ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
        });
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
