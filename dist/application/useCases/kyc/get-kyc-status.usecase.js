"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKycStatusUseCase = void 0;
const result_1 = require("@result/result");
const kyc_repository_1 = require("@domain/entities/kyc/kyc.repository");
class GetKycStatusUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute(userId, kycType = kyc_repository_1.KYCType.SELLER) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return result_1.Result.fail('User not found');
        }
        const kycProfile = await this.kycRepository.findByUserId(userId, kycType);
        if (!kycProfile) {
            return result_1.Result.ok({ status: 'NOT_SUBMITTED', profile: null });
        }
        return result_1.Result.ok({ status: kycProfile.verification_status, profile: kycProfile });
    }
}
exports.GetKycStatusUseCase = GetKycStatusUseCase;
