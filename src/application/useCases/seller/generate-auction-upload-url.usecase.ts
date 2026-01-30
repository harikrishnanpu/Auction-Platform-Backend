import { IStorageService } from "../../services/storage/storage.service";
import { Result } from "../../../domain/shared/result";
import { v4 as uuidv4 } from "uuid";

export interface GenerateAuctionMediaUrlDto {
    sellerId: string;
    fileName: string;
    contentType: string;
    mediaType: 'image' | 'video';
}

export interface AuctionUploadUrlResponse {
    uploadUrl: string;
    fileKey: string;
}

export class GenerateAuctionUploadUrlUseCase {
    constructor(private storageService: IStorageService) { }

    async execute(dto: GenerateAuctionMediaUrlDto): Promise<Result<AuctionUploadUrlResponse>> {
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

        if (dto.mediaType === 'image' && !imageTypes.includes(dto.contentType)) {
            return Result.fail('Invalid image type. Supported: JPEG, PNG, WEBP');
        }
        if (dto.mediaType === 'video' && !videoTypes.includes(dto.contentType)) {
            return Result.fail('Invalid video type. Supported: MP4, WEBM, MOV');
        }

        const ext = dto.fileName.split('.').pop() || 'bin';
        const key = `auctions/${dto.sellerId}/${uuidv4()}.${ext}`;

        try {
            const uploadUrl = await this.storageService.getPresignedUploadUrl(
                key,
                dto.contentType,
                1800
            );
            return Result.ok({ uploadUrl, fileKey: key });
        } catch (error) {
            return Result.fail('Failed to generate upload URL');
        }
    }
}
