import { IStorageService } from '../../services/storage/storage.service';
import { GenerateUploadUrlDto, UploadUrlResponseDto } from '../../dtos/kyc/kyc.dto';
import { KYCType } from '../../../domain/kyc/kyc.repository';
import { Result } from '../../../domain/shared/result';
import { v4 as uuidv4 } from 'uuid';

export class GenerateUploadUrlUseCase {
    constructor(private storageService: IStorageService) { }

    async execute(dto: GenerateUploadUrlDto): Promise<Result<UploadUrlResponseDto>> {

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(dto.contentType)) {
            return Result.fail('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
        }

        const fileExtension = dto.fileName.split('.').pop() || 'bin';
        const kycType = dto.kycType || KYCType.SELLER;
        const fileKey = `kyc/${kycType}/${dto.userId}/${dto.documentType}/${uuidv4()}.${fileExtension}`;

        try {
            const uploadUrl = await this.storageService.getPresignedUploadUrl(
                fileKey,
                dto.contentType,
                3600
            );

            return Result.ok<UploadUrlResponseDto>({
                uploadUrl,
                fileKey,
                expiresIn: 3600,
            });
        } catch (error) {
            return Result.fail('Failed to generate upload URL');
        }
    }
}
