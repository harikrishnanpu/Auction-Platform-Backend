"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockUserUseCase = void 0;
const result_1 = require("@result/result");
class BlockUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, block) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        if (block) {
            user.block();
        }
        else {
            user.unblock();
        }
        await this.userRepository.save(user);
        return result_1.Result.ok(undefined);
    }
}
exports.BlockUserUseCase = BlockUserUseCase;
