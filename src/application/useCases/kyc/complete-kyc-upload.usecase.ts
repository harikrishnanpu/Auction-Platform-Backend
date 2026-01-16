import { IUserRepository } from '../../../domain/user/user.repository';
import { CompleteKycUploadDto } from '../../dtos/kyc/kyc.dto';
import { Result } from '../../../domain/shared/result';
import { UserId } from '../../../domain/user/user-id.vo';
import prisma from '../../../utils/prismaClient';
import { v4 as uuidv4 } from 'uuid';

export class CompleteKycUploadUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: CompleteKycUploadDto): Promise<Result<void>> {
        const userIdOrError = UserId.create(dto.userId);
        if (userIdOrError.isFailure) {
            return Result.fail('Invalid user ID');
        }

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) {
            return Result.fail('User not found');
        }

        // Construct S3 URL from file key
        const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
        const region = process.env.AWS_REGION || 'us-east-1';
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${dto.fileKey}`;

        try {
            // Check if KYC profile exists
            const existingKyc = await prisma.kYCProfile.findFirst({
                where: { user_id: dto.userId }
            });

            const updateData: any = {
                verification_status: 'PENDING',
                updated_at: new Date(),
            };

            // Update the appropriate document URL field
            if (dto.documentType === 'id_front') {
                updateData.id_front_url = fileUrl;
            } else if (dto.documentType === 'id_back') {
                updateData.id_back_url = fileUrl;
            } else if (dto.documentType === 'address_proof') {
                updateData.address_proof_url = fileUrl;
            }

            // Update other fields if provided
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
                // Update existing KYC profile
                await prisma.kYCProfile.update({
                    where: { kyc_id: existingKyc.kyc_id },
                    data: updateData,
                });
            } else {
                // Create new KYC profile
                await prisma.kYCProfile.create({
                    data: {
                        kyc_id: uuidv4(),
                        user_id: dto.userId,
                        document_type: dto.documentTypeName || 'UNKNOWN',
                        document_number: dto.documentNumber || '',
                        address: dto.address || null,
                        verification_status: 'PENDING',
                        ...updateData,
                    },
                });
            }

            return Result.ok<void>(undefined);
        } catch (error) {
            console.error('Error completing KYC upload:', error);
            return Result.fail('Failed to save KYC document information');
        }
    }
}
