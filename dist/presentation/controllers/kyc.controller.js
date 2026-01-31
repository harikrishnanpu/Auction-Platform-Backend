"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const http_status_constants_1 = require("../../application/constants/http-status.constants");
const response_messages_1 = require("../../application/constants/response.messages");
class KycController {
    constructor(generateUploadUrlUseCase, completeKycUploadUseCase, getKycStatusUseCase, submitKycUseCase) {
        this.generateUploadUrlUseCase = generateUploadUrlUseCase;
        this.completeKycUploadUseCase = completeKycUploadUseCase;
        this.getKycStatusUseCase = getKycStatusUseCase;
        this.submitKycUseCase = submitKycUseCase;
        this.generateUploadUrl = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const dto = {
                    userId,
                    documentType: req.body.documentType,
                    fileName: req.body.fileName,
                    contentType: req.body.contentType,
                };
                if (!dto.documentType || !dto.fileName || !dto.contentType) {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: response_messages_1.ResponseMessages.KYC_MISSING_FIELDS });
                    return;
                }
                const result = await this.generateUploadUrlUseCase.execute(dto);
                if (result.isSuccess) {
                    res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
                }
                else {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
                }
            }
            catch (error) {
                console.log('Error generating upload URL:', error);
                res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.completeUpload = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const dto = {
                    userId,
                    documentType: req.body.documentType,
                    fileKey: req.body.fileKey,
                    documentTypeName: req.body.documentTypeName,
                    documentNumber: req.body.documentNumber,
                    address: req.body.address,
                };
                if (!dto.documentType || !dto.fileKey) {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: response_messages_1.ResponseMessages.KYC_MISSING_UPLOAD_FIELDS });
                    return;
                }
                const result = await this.completeKycUploadUseCase.execute(dto);
                if (result.isSuccess) {
                    res.status(http_status_constants_1.HttpStatus.OK).json({ message: response_messages_1.ResponseMessages.KYC_UPLOAD_SUCCESS });
                }
                else {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
                }
            }
            catch (error) {
                console.log('Error completing upload:', error);
                res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.getStatus = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const result = await this.getKycStatusUseCase.execute(userId);
                if (result.isSuccess) {
                    res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
                }
                else {
                    res.status(http_status_constants_1.HttpStatus.NOT_FOUND).json({ message: result.error });
                }
            }
            catch (error) {
                console.log('Error fetching KYC status:', error);
                res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
        this.submitKyc = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const result = await this.submitKycUseCase.execute(userId);
                if (result.isSuccess) {
                    res.status(http_status_constants_1.HttpStatus.OK).json({ message: response_messages_1.ResponseMessages.KYC_SUBMITTED_SUCCESS });
                }
                else {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
                }
            }
            catch (error) {
                console.error('Error submitting KYC:', error);
                res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
    }
}
exports.KycController = KycController;
