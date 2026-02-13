"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserUseCase = void 0;
const result_1 = require("@result/result");
class DeleteUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user)
                return result_1.Result.fail("User not found");
            await this.userRepository.delete(userId);
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.DeleteUserUseCase = DeleteUserUseCase;
