"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserByIdUseCase = void 0;
const result_1 = require("@result/result");
class GetUserByIdUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return result_1.Result.fail("User not found");
        return result_1.Result.ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        });
    }
}
exports.GetUserByIdUseCase = GetUserByIdUseCase;
