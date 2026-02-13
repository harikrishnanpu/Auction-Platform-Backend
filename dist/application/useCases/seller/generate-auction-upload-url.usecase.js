"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAuctionUploadUrlUseCase = void 0;
const result_1 = require("@result/result");
const uuid_1 = require("uuid");
class GenerateAuctionUploadUrlUseCase {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async execute(sellerId, fileName, fileType) {
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        const isValidImage = imageTypes.includes(fileType);
        const isValidVideo = videoTypes.includes(fileType);
        if (!isValidImage && !isValidVideo) {
            return result_1.Result.fail('Invalid file type. Supported: JPEG, PNG, WEBP, MP4, WEBM, MOV');
        }
        const ext = fileName.split('.').pop() || 'bin';
        const key = `auctions/${sellerId}/${(0, uuid_1.v4)()}.${ext}`;
        try {
            const uploadUrl = await this.storageService.getPresignedUploadUrl(key, fileType, 1800);
            return result_1.Result.ok({ uploadUrl, fileKey: key });
        }
        catch (error) {
            return result_1.Result.fail('Failed to generate upload URL');
        }
    }
}
exports.GenerateAuctionUploadUrlUseCase = GenerateAuctionUploadUrlUseCase;
