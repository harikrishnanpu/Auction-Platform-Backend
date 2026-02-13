"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignSellerRoleUseCase = void 0;
const result_1 = require("@result/result");
const user_entity_1 = require("@domain/entities/user/user.entity");
class AssignSellerRoleUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user)
                return result_1.Result.fail("User not found");
            if (!user.roles.includes(user_entity_1.UserRole.SELLER)) {
                user.addRole(user_entity_1.UserRole.SELLER);
                await this.userRepository.save(user);
            }
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.AssignSellerRoleUseCase = AssignSellerRoleUseCase;
