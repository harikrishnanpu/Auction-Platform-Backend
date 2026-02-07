"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteProfileUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class CompleteProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, phone, address) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        if (user.is_blocked) {
            return result_1.Result.fail("Account is blocked");
        }
        const updateResult = user.completeProfile(phone, address);
        if (updateResult.isFailure) {
            return result_1.Result.fail(updateResult.error);
        }
        await this.userRepository.save(user);
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        });
    }
}
exports.CompleteProfileUseCase = CompleteProfileUseCase;
