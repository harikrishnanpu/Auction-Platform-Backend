"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserByIdUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class GetUserByIdUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return result_1.Result.fail("User not found");
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            joined_at: user.created_at
        });
    }
}
exports.GetUserByIdUseCase = GetUserByIdUseCase;
