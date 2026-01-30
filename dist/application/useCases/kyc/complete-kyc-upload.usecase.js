"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteKycUploadUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
const kyc_repository_1 = require("../../../domain/kyc/kyc.repository");
class CompleteKycUploadUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute(dto) {
        const userIdOrError = user_id_vo_1.UserId.create(dto.userId);
        if (userIdOrError.isFailure) {
            return result_1.Result.fail('Invalid user ID');
        }
        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) {
            return result_1.Result.fail('User not found');
        }
        try {
            const existingKyc = await this.kycRepository.findByUserId(dto.userId);
            const updateData = {
                user_id: dto.userId,
                verification_status: kyc_repository_1.KYCStatus.PENDING,
            };
            if (dto.documentType === 'id_front') {
                updateData.id_front_url = dto.fileKey;
            }
            else if (dto.documentType === 'id_back') {
                updateData.id_back_url = dto.fileKey;
            }
            else if (dto.documentType === 'address_proof') {
                updateData.address_proof_url = dto.fileKey;
            }
            if (dto.documentTypeName) {
                updateData.document_type = dto.documentTypeName;
            }
            if (dto.documentNumber) {
                updateData.document_number = dto.documentNumber;
            }
            if (dto.address) {
                updateData.address = dto.address;
            }
            if (dto.kycType) {
                updateData.kyc_type = dto.kycType;
            }
            if (existingKyc) {
                updateData.kyc_id = existingKyc.kyc_id;
            }
            await this.kycRepository.save(updateData);
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            console.error('Error completing KYC upload:', error);
            return result_1.Result.fail('Failed to save KYC document information');
        }
    }
}
exports.CompleteKycUploadUseCase = CompleteKycUploadUseCase;
