"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class DeleteUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        await this.userRepository.delete(userId);
        return result_1.Result.ok(undefined);
    }
}
exports.DeleteUserUseCase = DeleteUserUseCase;
