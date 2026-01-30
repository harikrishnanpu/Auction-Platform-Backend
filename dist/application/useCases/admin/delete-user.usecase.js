"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
class DeleteUserUseCase {
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
        // Delete user (cascade will handle related records)
        await this.userRepository.delete(userIdOrError.getValue());
        return result_1.Result.ok(undefined);
    }
}
exports.DeleteUserUseCase = DeleteUserUseCase;
