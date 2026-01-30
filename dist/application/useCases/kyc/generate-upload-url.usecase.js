"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateUploadUrlUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const uuid_1 = require("uuid");
class GenerateUploadUrlUseCase {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async execute(dto) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(dto.contentType)) {
            return result_1.Result.fail('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
        }
        const fileExtension = dto.fileName.split('.').pop() || 'bin';
        const fileKey = `kyc/${dto.userId}/${dto.documentType}/${(0, uuid_1.v4)()}.${fileExtension}`;
        try {
            const uploadUrl = await this.storageService.getPresignedUploadUrl(fileKey, dto.contentType, 3600);
            return result_1.Result.ok({
                uploadUrl,
                fileKey,
                expiresIn: 3600,
            });
        }
        catch (error) {
            return result_1.Result.fail('Failed to generate upload URL');
        }
    }
}
exports.GenerateUploadUrlUseCase = GenerateUploadUrlUseCase;
