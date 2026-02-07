"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
class LoginUserUseCase {
    constructor(userRepository, passwordHasher, tokenService, logger) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.logger = logger;
    }
    async execute(dto) {
        const emailResult = email_vo_1.Email.create(dto.email);
        if (emailResult.isFailure)
            return result_1.Result.fail(emailResult.error);
        const email = emailResult.getValue();
        this.logger.info(`login for email: ${email.value}`);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return result_1.Result.fail("Invalid email or password");
        }
        if (user.props.is_blocked) {
            return result_1.Result.fail("Account is blocked");
        }
        if (!user.props.is_verified) {
            return result_1.Result.fail("Please verify your email address");
        }
        if (user.props.password) {
            const isValidPassword = await this.passwordHasher.compare(dto.password, user.props.password.value);
            if (!isValidPassword) {
                return result_1.Result.fail("Invalid email or password");
            }
        }
        const payload = {
            userId: user.id.toString(),
            email: user.props.email.value,
            roles: user.props.roles
        };
        const tokens = this.tokenService.generateTokens(payload);
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.props.name,
            email: user.props.email.value,
            roles: user.props.roles,
            ...tokens
        });
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
