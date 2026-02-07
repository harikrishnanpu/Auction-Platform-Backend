"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteProfileUseCase = void 0;
const result_1 = require("@domain/shared/result");
class CompleteProfileUseCase {
    constructor(_userRepository, _logger) {
        this._userRepository = _userRepository;
        this._logger = _logger;
    }
    async execute(userId, phone, address) {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        if (user.is_blocked) {
            return result_1.Result.fail("User is blocked");
        }
        const completeResult = user.completeProfile(phone, address);
        if (completeResult.isFailure) {
            return result_1.Result.fail(completeResult.error);
        }
        const updatedUser = await this._userRepository.update(userId, user);
        return result_1.Result.ok(updatedUser);
    }
}
exports.CompleteProfileUseCase = CompleteProfileUseCase;
