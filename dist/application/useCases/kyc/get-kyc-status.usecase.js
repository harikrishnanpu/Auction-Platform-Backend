"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKycStatusUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
class GetKycStatusUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute(userId) {
        const userIdOrError = user_id_vo_1.UserId.create(userId);
        if (userIdOrError.isFailure) {
            return result_1.Result.fail('Invalid user ID');
        }
        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) {
            return result_1.Result.fail('User not found');
        }
        const kycProfile = await this.kycRepository.findByUserId(userId);
        if (!kycProfile) {
            return result_1.Result.ok({ status: 'NOT_SUBMITTED', profile: null });
        }
        return result_1.Result.ok({ status: kycProfile.verification_status, profile: kycProfile });
    }
}
exports.GetKycStatusUseCase = GetKycStatusUseCase;
