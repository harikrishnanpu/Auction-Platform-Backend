"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
class GetProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        const userIdResult = user_id_vo_1.UserId.create(userId);
        if (userIdResult.isFailure) {
            return result_1.Result.fail(userIdResult.error);
        }
        const user = await this.userRepository.findById(userIdResult.getValue());
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_active: user.is_active,
            is_verified: user.is_verified,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        });
    }
}
exports.GetProfileUseCase = GetProfileUseCase;
