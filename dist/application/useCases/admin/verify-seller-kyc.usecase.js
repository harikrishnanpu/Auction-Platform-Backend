"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifySellerKycUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_entity_1 = require("../../../domain/user/user.entity");
const kyc_repository_1 = require("../../../domain/kyc/kyc.repository");
class VerifySellerKycUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute(userId, verify, reasonType, reasonMessage) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        // Update KYC status
        const kycProfile = await this.kycRepository.findByUserId(userId, kyc_repository_1.KYCType.SELLER);
        if (!kycProfile) {
            return result_1.Result.fail("KYC profile not found");
        }
        if (verify && kycProfile.verification_status === kyc_repository_1.KYCStatus.VERIFIED) {
            return result_1.Result.fail("KYC is already verified");
        }
        if (!verify && kycProfile.verification_status === kyc_repository_1.KYCStatus.REJECTED) {
            return result_1.Result.fail("KYC is already rejected");
        }
        const normalizedReasonType = reasonType?.trim();
        const normalizedReasonMessage = reasonMessage?.trim();
        if (!verify) {
            if (!normalizedReasonType) {
                return result_1.Result.fail("Rejection reason type is required");
            }
            if (!normalizedReasonMessage) {
                return result_1.Result.fail("Rejection reason message is required");
            }
        }
        await this.kycRepository.updateStatus(kycProfile.kyc_id, verify ? kyc_repository_1.KYCStatus.VERIFIED : kyc_repository_1.KYCStatus.REJECTED, verify ? null : normalizedReasonType || null, verify ? null : normalizedReasonMessage || null, verify ? null : new Date());
        // If verifying, ensure user has SELLER role
        if (verify && !user.roles.includes(user_entity_1.UserRole.SELLER)) {
            user.addRole(user_entity_1.UserRole.SELLER);
            await this.userRepository.save(user);
        }
        return result_1.Result.ok(undefined);
    }
}
exports.VerifySellerKycUseCase = VerifySellerKycUseCase;
