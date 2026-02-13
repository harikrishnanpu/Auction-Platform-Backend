"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteKycUploadUseCase = void 0;
const result_1 = require("@result/result");
const kyc_repository_1 = require("@domain/entities/kyc/kyc.repository");
class CompleteKycUploadUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute(dto) {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            return result_1.Result.fail('User not found');
        }
        try {
            const kycType = dto.kycType || kyc_repository_1.KYCType.SELLER;
            const existingKyc = await this.kycRepository.findByUserId(dto.userId, kycType);
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
            else {
                updateData.kyc_type = kycType;
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
