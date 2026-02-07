"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitKycUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const kyc_repository_1 = require("../../../domain/kyc/kyc.repository");
class SubmitKycUseCase {
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
            return result_1.Result.fail('KYC profile not found. Please upload documents first.');
        }
        // Validate that necessary documents are present before submission
        if (!kycProfile.id_front_url || !kycProfile.id_back_url || !kycProfile.address_proof_url) {
            return result_1.Result.fail('Please upload all required documents (ID Front, ID Back, Address Proof) before submitting.');
        }
        // If already verified, don't change
        if (kycProfile.verification_status === kyc_repository_1.KYCStatus.VERIFIED) {
            return result_1.Result.fail('KYC is already verified.');
        }
        await this.kycRepository.save({
            kyc_id: kycProfile.kyc_id,
            user_id: userId,
            verification_status: kyc_repository_1.KYCStatus.PENDING,
            kyc_type: kycType
        });
        return result_1.Result.ok(undefined);
    }
}
exports.SubmitKycUseCase = SubmitKycUseCase;
