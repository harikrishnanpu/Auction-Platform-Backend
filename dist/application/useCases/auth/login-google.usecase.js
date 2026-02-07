"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginWithGoogleUseCase = void 0;
const user_entity_1 = require("../../../domain/user/user.entity");
const email_vo_1 = require("../../../domain/user/email.vo");
const result_1 = require("../../../domain/shared/result");
class LoginWithGoogleUseCase {
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    async execute(dto) {
        try {
            let user = await this.userRepository.findByGoogleId(dto.googleId);
            if (!user) {
                const emailResult = email_vo_1.Email.create(dto.email);
                if (emailResult.isFailure) {
                    return result_1.Result.fail(emailResult.error);
                }
                const email = emailResult.getValue();
                const existingUser = await this.userRepository.findByEmail(email);
                if (existingUser) {
                    const payload = {
                        userId: existingUser.id.toString(),
                        email: existingUser.props.email.value,
                        roles: existingUser.props.roles
                    };
                    const tokens = this.tokenService.generateTokens(payload);
                    return result_1.Result.ok({ ...tokens, user: existingUser });
                }
                const userProps = {
                    name: dto.name,
                    email: email,
                    phone: undefined,
                    address: "",
                    avatar_url: dto.avatar,
                    roles: [user_entity_1.UserRole.USER],
                    is_blocked: false,
                    is_verified: false,
                    created_at: new Date(),
                    is_profile_completed: false,
                    googleId: dto.googleId,
                    password: undefined,
                };
                const userResult = user_entity_1.User.create(userProps);
                if (userResult.isFailure) {
                    return result_1.Result.fail(userResult.error);
                }
                user = userResult.getValue();
                await this.userRepository.save(user);
            }
            if (user.props.is_blocked) {
                return result_1.Result.fail("User is blocked");
            }
            const payload = {
                userId: user.id.toString(),
                email: user.props.email.value,
                roles: user.props.roles
            };
            const tokens = this.tokenService.generateTokens(payload);
            return result_1.Result.ok({ ...tokens, user });
        }
        catch (error) {
            console.log(error);
            return result_1.Result.fail("Internal server error during Google Login");
        }
    }
}
exports.LoginWithGoogleUseCase = LoginWithGoogleUseCase;
