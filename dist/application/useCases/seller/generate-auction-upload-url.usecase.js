"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAuctionUploadUrlUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const uuid_1 = require("uuid");
class GenerateAuctionUploadUrlUseCase {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async execute(dto) {
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (dto.mediaType === 'image' && !imageTypes.includes(dto.contentType)) {
            return result_1.Result.fail('Invalid image type. Supported: JPEG, PNG, WEBP');
        }
        if (dto.mediaType === 'video' && !videoTypes.includes(dto.contentType)) {
            return result_1.Result.fail('Invalid video type. Supported: MP4, WEBM, MOV');
        }
        const ext = dto.fileName.split('.').pop() || 'bin';
        const key = `auctions/${dto.sellerId}/${(0, uuid_1.v4)()}.${ext}`;
        try {
            const uploadUrl = await this.storageService.getPresignedUploadUrl(key, dto.contentType, 1800);
            return result_1.Result.ok({ uploadUrl, fileKey: key });
        }
        catch (error) {
            return result_1.Result.fail('Failed to generate upload URL');
        }
    }
}
exports.GenerateAuctionUploadUrlUseCase = GenerateAuctionUploadUrlUseCase;
