"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteProfileUseCase = void 0;
const result_1 = require("@result/result");
const phone_vo_1 = require("@domain/value-objects/user/phone.vo");
class CompleteProfileUseCase {
    constructor(_userRepository, _logger) {
        this._userRepository = _userRepository;
        this._logger = _logger;
    }
    async execute(request) {
        const { userId, phone, address } = request;
        const user = await this._userRepository.findById(userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        if (user.is_blocked) {
            return result_1.Result.fail("User is blocked");
        }
        const phoneResult = phone_vo_1.Phone.create(phone);
        if (phoneResult.isFailure) {
            return result_1.Result.fail(phoneResult.error);
        }
        user.completeProfile(phoneResult.getValue(), address);
        await this._userRepository.save(user);
        return result_1.Result.ok(user);
    }
}
exports.CompleteProfileUseCase = CompleteProfileUseCase;
