"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginGoogleUseCase = void 0;
const user_entity_1 = require("@domain/entities/user/user.entity");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
const result_1 = require("@result/result");
class LoginGoogleUseCase {
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    mapToResponse(user, tokens) {
        return {
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            is_verified: user.is_verified,
            is_blocked: user.is_blocked,
            is_profile_completed: user.is_profile_completed,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }
    async execute(dto) {
        try {
            let user = await this.userRepository.findByGoogleId(dto.googleId);
            if (!user) {
                const emailResult = email_vo_1.Email.create(dto.email);
                if (emailResult.isFailure)
                    return result_1.Result.fail(emailResult.error);
                const email = emailResult.getValue();
                const existingUser = await this.userRepository.findByEmail(email);
                if (existingUser) {
                    const payload = {
                        userId: existingUser.id,
                        email: existingUser.email.getValue(),
                        roles: existingUser.roles
                    };
                    const tokens = this.tokenService.generateTokens(payload);
                    return result_1.Result.ok(this.mapToResponse(existingUser, tokens));
                }
                const userResult = user_entity_1.User.create({
                    name: dto.name,
                    email: email,
                    address: "",
                    avatar_url: dto.avatar,
                    roles: [user_entity_1.UserRole.USER],
                    is_blocked: false,
                    is_verified: true,
                    is_profile_completed: false,
                    googleId: dto.googleId,
                });
                if (userResult.isFailure)
                    return result_1.Result.fail(userResult.error);
                user = userResult.getValue();
                await this.userRepository.save(user);
            }
            if (user.is_blocked)
                return result_1.Result.fail("User is blocked");
            const payload = {
                userId: user.id,
                email: user.email.getValue(),
                roles: user.roles
            };
            const tokens = this.tokenService.generateTokens(payload);
            return result_1.Result.ok(this.mapToResponse(user, tokens));
        }
        catch (error) {
            console.error(error);
            return result_1.Result.fail("Internal server error during Google Login");
        }
    }
}
exports.LoginGoogleUseCase = LoginGoogleUseCase;
