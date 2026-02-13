"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellerByIdUseCase = void 0;
const result_1 = require("@result/result");
const kyc_repository_1 = require("@domain/entities/kyc/kyc.repository");
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
        try {
            const user = await this.userRepository.findById(id);
            if (!user)
                return result_1.Result.fail("User not found");
            const kycProfile = await this.kycRepository.findByUserId(id, kyc_repository_1.KYCType.SELLER);
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
                id: user.id || id,
                name: user.name,
                email: user.email.getValue(),
                phone: user.phone?.getValue(),
                address: user.address,
                avatar_url: user.avatar_url,
                roles: user.roles,
                is_blocked: user.is_blocked,
                is_verified: user.is_verified,
                joined_at: user.created_at,
                kyc_status: kycProfile?.verification_status || 'NOT_SUBMITTED',
                kyc_profile: kycProfile
            });
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetSellerByIdUseCase = GetSellerByIdUseCase;
