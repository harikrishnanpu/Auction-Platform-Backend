"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const kyc_repository_1 = require("../../../domain/kyc/kyc.repository");
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
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const kycType = this.parseKycType(req.body.kycType);
                if (req.body.kycType && !kycType) {
                    res.status(400).json({ message: 'Invalid kycType' });
                    return;
                }
                const dto = {
                    userId,
                    documentType: req.body.documentType,
                    fileName: req.body.fileName,
                    contentType: req.body.contentType,
                    kycType
                };
                if (!dto.documentType || !dto.fileName || !dto.contentType) {
                    res.status(400).json({ message: 'Missing required fields: documentType, fileName, contentType' });
                    return;
                }
                const result = await this.generateUploadUrlUseCase.execute(dto);
                if (result.isSuccess) {
                    res.status(200).json(result.getValue());
                }
                else {
                    res.status(400).json({ message: result.error });
                }
            }
            catch (error) {
                console.log('Error generating upload URL:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        };
        this.completeUpload = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const kycType = this.parseKycType(req.body.kycType);
                if (req.body.kycType && !kycType) {
                    res.status(400).json({ message: 'Invalid kycType' });
                    return;
                }
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
                    res.status(400).json({ message: 'Missing required fields: documentType, fileKey' });
                    return;
                }
                const result = await this.completeKycUploadUseCase.execute(dto);
                if (result.isSuccess) {
                    res.status(200).json({ message: 'Document upload completed successfully' });
                }
                else {
                    res.status(400).json({ message: result.error });
                }
            }
            catch (error) {
                console.log('Error completing upload:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        };
        this.getStatus = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const kycType = this.parseKycType(req.query.kycType) || kyc_repository_1.KYCType.SELLER;
                if (req.query.kycType && !this.parseKycType(req.query.kycType)) {
                    res.status(400).json({ message: 'Invalid kycType' });
                    return;
                }
                const result = await this.getKycStatusUseCase.execute(userId, kycType);
                if (result.isSuccess) {
                    res.status(200).json(result.getValue());
                }
                else {
                    res.status(404).json({ message: result.error });
                }
            }
            catch (error) {
                console.log('Error fetching KYC status:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        };
        this.submitKyc = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const kycType = this.parseKycType(req.body.kycType) || kyc_repository_1.KYCType.SELLER;
                if (req.body.kycType && !this.parseKycType(req.body.kycType)) {
                    res.status(400).json({ message: 'Invalid kycType' });
                    return;
                }
                const result = await this.submitKycUseCase.execute(userId, kycType);
                if (result.isSuccess) {
                    res.status(200).json({ message: 'KYC submitted successfully' });
                }
                else {
                    res.status(400).json({ message: result.error });
                }
            }
            catch (error) {
                console.error('Error submitting KYC:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        };
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
