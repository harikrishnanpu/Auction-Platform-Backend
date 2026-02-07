"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignSellerRoleUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_entity_1 = require("../../../domain/user/user.entity");
class AssignSellerRoleUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        if (!user.roles.includes(user_entity_1.UserRole.SELLER)) {
            user.addRole(user_entity_1.UserRole.SELLER);
            await this.userRepository.save(user);
        }
        return result_1.Result.ok(undefined);
    }
}
exports.AssignSellerRoleUseCase = AssignSellerRoleUseCase;
