"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignSellerRoleUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
const user_entity_1 = require("../../../domain/user/user.entity");
class AssignSellerRoleUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        const userIdOrError = user_id_vo_1.UserId.create(userId);
        if (userIdOrError.isFailure)
            return result_1.Result.fail("Invalid User ID");
        const user = await this.userRepository.findById(userIdOrError.getValue());
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
