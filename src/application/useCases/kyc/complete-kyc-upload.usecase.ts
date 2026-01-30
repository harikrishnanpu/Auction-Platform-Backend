import { IUserRepository } from '../../../domain/user/user.repository';
import { CompleteKycUploadDto } from '../../dtos/kyc/kyc.dto';
import { Result } from '../../../domain/shared/result';
import { UserId } from '../../../domain/user/user-id.vo';
import { IKYCRepository, KYCStatus } from '../../../domain/kyc/kyc.repository';

export class CompleteKycUploadUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    async execute(dto: CompleteKycUploadDto): Promise<Result<void>> {
        const userIdOrError = UserId.create(dto.userId);
        if (userIdOrError.isFailure) {
            return Result.fail('Invalid user ID');
        }

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) {
            return Result.fail('User not found');
        }

        try {
            const existingKyc = await this.kycRepository.findByUserId(dto.userId);

            const updateData: any = {
                user_id: dto.userId,
                verification_status: KYCStatus.PENDING,
            };

            if (dto.documentType === 'id_front') {
                updateData.id_front_url = dto.fileKey;
            } else if (dto.documentType === 'id_back') {
                updateData.id_back_url = dto.fileKey;
            } else if (dto.documentType === 'address_proof') {
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

            return Result.ok<void>(undefined);
        } catch (error) {
            console.error('Error completing KYC upload:', error);
            return Result.fail('Failed to save KYC document information');
        }
    }
}
