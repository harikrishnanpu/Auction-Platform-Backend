"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
class LoginUserUseCase {
    constructor(userRepository, passwordHasher, jwtService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.jwtService = jwtService;
    }
    async execute(dto) {
        const emailResult = email_vo_1.Email.create(dto.email);
        if (emailResult.isFailure)
            return result_1.Result.fail(emailResult.error);
        const email = emailResult.getValue();
        // 1. Find User
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return result_1.Result.fail("Invalid email or password");
        }
        // 2. Check Active/Blocked/Verified
        if (!user.is_active) {
            return result_1.Result.fail("Account is inactive");
        }
        if (user.is_blocked) {
            return result_1.Result.fail("Account is blocked");
        }
        if (!user.is_verified) {
            return result_1.Result.fail("Please verify your email address");
        }
        // 3. Compare Password
        const isValidPassword = await this.passwordHasher.compare(dto.password, user.password.value);
        if (!isValidPassword) {
            return result_1.Result.fail("Invalid email or password");
        }
        // 4. Generate Tokens
        const accessToken = this.jwtService.sign({ userId: user.id.toString(), roles: user.roles });
        const refreshToken = this.jwtService.signRefresh({ userId: user.id.toString(), roles: user.roles });
        // 5. Return DTO
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
