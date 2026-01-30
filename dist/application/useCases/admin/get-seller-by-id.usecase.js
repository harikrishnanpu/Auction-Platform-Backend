"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellerByIdUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
const user_entity_1 = require("../../../domain/user/user.entity");
const kyc_repository_1 = require("../../../domain/kyc/kyc.repository");
class GetSellerByIdUseCase {
    constructor(userRepository, kycRepository, storageService) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
        this.storageService = storageService;
    }
    extractS3Key(value) {
        if (!value)
            return value;
        if (!value.startsWith("http"))
            return value;
        const marker = ".amazonaws.com/";
        const markerIndex = value.indexOf(marker);
        if (markerIndex === -1)
            return value;
        return value.slice(markerIndex + marker.length);
    }
    async execute(id) {
        const userIdOrError = user_id_vo_1.UserId.create(id);
        if (userIdOrError.isFailure)
            return result_1.Result.fail("Invalid User ID");
        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user)
            return result_1.Result.fail("User not found");
        const hasSellerRole = user.roles.includes(user_entity_1.UserRole.SELLER);
        const kycProfile = await this.kycRepository.findByUserId(id, kyc_repository_1.KYCType.SELLER);
        if (!hasSellerRole && (!kycProfile || kycProfile.verification_status !== 'PENDING')) {
            return result_1.Result.fail("User is not a seller and has no pending seller KYC");
        }
        if (kycProfile) {
            if (kycProfile.id_front_url) {
                const key = this.extractS3Key(kycProfile.id_front_url);
                kycProfile.id_front_url = await this.storageService.getPresignedDownloadUrl(key);
            }
            if (kycProfile.id_back_url) {
                const key = this.extractS3Key(kycProfile.id_back_url);
                kycProfile.id_back_url = await this.storageService.getPresignedDownloadUrl(key);
            }
            if (kycProfile.address_proof_url) {
                const key = this.extractS3Key(kycProfile.address_proof_url);
                kycProfile.address_proof_url = await this.storageService.getPresignedDownloadUrl(key);
            }
        }
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.roles,
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            joined_at: user.created_at,
            kyc_status: kycProfile?.verification_status || 'NOT_SUBMITTED',
            kyc_profile: kycProfile
        });
    }
}
exports.GetSellerByIdUseCase = GetSellerByIdUseCase;
