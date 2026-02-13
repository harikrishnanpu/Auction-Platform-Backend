import { IStorageService } from "@application/services/storage/storage.service";
import { Result } from "@result/result";
import { v4 as uuidv4 } from "uuid";
import { IGenerateAuctionUploadUrlUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class GenerateAuctionUploadUrlUseCase implements IGenerateAuctionUploadUrlUseCase {
    constructor(private storageService: IStorageService) { }

    async execute(sellerId: string, fileName: string, fileType: string): Promise<Result<any>> {
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

        const isValidImage = imageTypes.includes(fileType);
        const isValidVideo = videoTypes.includes(fileType);

        if (!isValidImage && !isValidVideo) {
            return Result.fail('Invalid file type. Supported: JPEG, PNG, WEBP, MP4, WEBM, MOV');
        }

        const ext = fileName.split('.').pop() || 'bin';
        const key = `auctions/${sellerId}/${uuidv4()}.${ext}`;

        try {
            const uploadUrl = await this.storageService.getPresignedUploadUrl(
                key,
                fileType,
                1800
            );
            return Result.ok({ uploadUrl, fileKey: key });
        } catch (error) {
            return Result.fail('Failed to generate upload URL');
        }
    }
}
