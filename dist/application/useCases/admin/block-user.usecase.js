"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockUserUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
class BlockUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, block) {
        const userIdOrError = user_id_vo_1.UserId.create(userId);
        if (userIdOrError.isFailure)
            return result_1.Result.fail("Invalid User ID");
        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user)
            return result_1.Result.fail("User not found");
        user.props.is_blocked = block;
        await this.userRepository.save(user);
        return result_1.Result.ok(undefined);
    }
}
exports.BlockUserUseCase = BlockUserUseCase;
