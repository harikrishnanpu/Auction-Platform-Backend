"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifySellerKycUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
const user_entity_1 = require("../../../domain/user/user.entity");
const kyc_repository_1 = require("../../../domain/kyc/kyc.repository");
class VerifySellerKycUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute(userId, verify) {
        const userIdOrError = user_id_vo_1.UserId.create(userId);
        if (userIdOrError.isFailure)
            return result_1.Result.fail("Invalid User ID");
        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user)
            return result_1.Result.fail("User not found");
        // Update KYC status
        const kycProfile = await this.kycRepository.findByUserId(userId, kyc_repository_1.KYCType.SELLER);
        if (!kycProfile) {
            return result_1.Result.fail("KYC profile not found");
        }
        await this.kycRepository.updateStatus(kycProfile.kyc_id, verify ? kyc_repository_1.KYCStatus.VERIFIED : kyc_repository_1.KYCStatus.REJECTED);
        // If verifying, ensure user has SELLER role
        if (verify && !user.roles.includes(user_entity_1.UserRole.SELLER)) {
            user.addRole(user_entity_1.UserRole.SELLER);
            await this.userRepository.save(user);
        }
        return result_1.Result.ok(undefined);
    }
}
exports.VerifySellerKycUseCase = VerifySellerKycUseCase;
