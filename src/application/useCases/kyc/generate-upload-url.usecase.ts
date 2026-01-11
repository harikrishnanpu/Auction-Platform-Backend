import { IStorageService } from '../../../domain/services/storage/storage.service';
import { GenerateUploadUrlDto, UploadUrlResponseDto } from '../../dtos/kyc/kyc.dto';
import { Result } from '../../../domain/shared/result';
import { v4 as uuidv4 } from 'uuid';

export class GenerateUploadUrlUseCase {
    constructor(private storageService: IStorageService) { }

    async execute(dto: GenerateUploadUrlDto): Promise<Result<UploadUrlResponseDto>> {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(dto.contentType)) {
            return Result.fail('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
        }

        // Validate file size (5MB limit)
        // Note: Actual file size validation should be done on frontend before requesting URL

        // Generate unique file key
        const fileExtension = dto.fileName.split('.').pop() || 'bin';
        const fileKey = `kyc/${dto.userId}/${dto.documentType}/${uuidv4()}.${fileExtension}`;

        try {
            // Generate pre-signed URL (valid for 1 hour)
            const uploadUrl = await this.storageService.getPresignedUploadUrl(
                fileKey,
                dto.contentType,
                3600 // 1 hour
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
