"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const kyc_repository_1 = require("domain/entities/kyc/kyc.repository");
const status_code_1 = require("constants/status.code");
const app_error_1 = require("shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class KycController {
    constructor(generateUploadUrlUseCase, completeKycUploadUseCase, getKycStatusUseCase, submitKycUseCase) {
        this.generateUploadUrlUseCase = generateUploadUrlUseCase;
        this.completeKycUploadUseCase = completeKycUploadUseCase;
        this.getKycStatusUseCase = getKycStatusUseCase;
        this.submitKycUseCase = submitKycUseCase;
        this.generateUploadUrl = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError('Unauthorized', status_code_1.STATUS_CODE.UNAUTHORIZED);
            const kycType = this.parseKycType(req.body.kycType);
            if (req.body.kycType && !kycType)
                throw new app_error_1.AppError('Invalid kycType', status_code_1.STATUS_CODE.BAD_REQUEST);
            const dto = {
                userId,
                documentType: req.body.documentType,
                fileName: req.body.fileName,
                contentType: req.body.contentType,
                kycType
            };
            if (!dto.documentType || !dto.fileName || !dto.contentType) {
                throw new app_error_1.AppError('Missing required fields', status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            const result = await this.generateUploadUrlUseCase.execute(dto);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json(result.getValue());
        });
        this.completeUpload = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError('Unauthorized', status_code_1.STATUS_CODE.UNAUTHORIZED);
            const kycType = this.parseKycType(req.body.kycType);
            if (req.body.kycType && !kycType)
                throw new app_error_1.AppError('Invalid kycType', status_code_1.STATUS_CODE.BAD_REQUEST);
            const dto = {
                userId,
                documentType: req.body.documentType,
                fileKey: req.body.fileKey,
                documentTypeName: req.body.documentTypeName,
                documentNumber: req.body.documentNumber,
                address: req.body.address,
                kycType
            };
            if (!dto.documentType || !dto.fileKey) {
                throw new app_error_1.AppError('Missing required fields: documentType, fileKey', status_code_1.STATUS_CODE.BAD_REQUEST);
            }
            const result = await this.completeKycUploadUseCase.execute(dto);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: 'Document upload completed successfully' });
        });
        this.getStatus = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError('Unauthorized', status_code_1.STATUS_CODE.UNAUTHORIZED);
            const kycType = this.parseKycType(req.query.kycType) || kyc_repository_1.KYCType.SELLER;
            const result = await this.getKycStatusUseCase.execute(userId); // Interface update needed if kycType is required
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json(result.getValue());
        });
        this.submitKyc = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError('Unauthorized', status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.submitKycUseCase.execute(userId);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: 'KYC submitted successfully' });
        });
    }
    parseKycType(value) {
        if (!value)
            return undefined;
        if (value === kyc_repository_1.KYCType.SELLER || value === kyc_repository_1.KYCType.MODERATOR)
            return value;
        return undefined;
    }
}
exports.KycController = KycController;
