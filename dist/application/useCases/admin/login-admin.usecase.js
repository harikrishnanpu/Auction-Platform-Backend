"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAdminUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
const user_entity_1 = require("../../../domain/user/user.entity");
class LoginAdminUseCase {
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(dto) {
        const emailResult = email_vo_1.Email.create(dto.email);
        if (emailResult.isFailure)
            return result_1.Result.fail(emailResult.error);
        const email = emailResult.getValue();
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return result_1.Result.fail("Invalid email or password");
        }
        if (!user.roles.includes(user_entity_1.UserRole.ADMIN)) {
            return result_1.Result.fail("Access Denied: Admin privileges required.");
        }
        if (!user.password) {
            return result_1.Result.fail("Invalid email or password");
        }
        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.value);
        if (!isValidPassword) {
            return result_1.Result.fail("Invalid email or password");
        }
        const payload = {
            userId: user.id.toString(),
            email: user.email.value,
            roles: user.roles
        };
        const tokens = this.tokenService.generateTokens(payload);
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            ...tokens
        });
    }
}
exports.LoginAdminUseCase = LoginAdminUseCase;
