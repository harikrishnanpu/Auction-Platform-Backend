import { Request, Response } from 'express';
import { GenerateUploadUrlUseCase } from '../../application/useCases/kyc/generate-upload-url.usecase';
import { CompleteKycUploadUseCase } from '../../application/useCases/kyc/complete-kyc-upload.usecase';
import { GetKycStatusUseCase } from '../../application/useCases/kyc/get-kyc-status.usecase';
import { SubmitKycUseCase } from '../../application/useCases/kyc/submit-kyc.usecase';
import { GenerateUploadUrlDto, CompleteKycUploadDto } from '../../application/dtos/kyc/kyc.dto';

export class KycController {
    constructor(
        private generateUploadUrlUseCase: GenerateUploadUrlUseCase,
        private completeKycUploadUseCase: CompleteKycUploadUseCase,
        private getKycStatusUseCase: GetKycStatusUseCase,
        private submitKycUseCase: SubmitKycUseCase
    ) { }

    public async generateUploadUrl(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const dto: GenerateUploadUrlDto = {
                userId,
                documentType: req.body.documentType,
                fileName: req.body.fileName,
                contentType: req.body.contentType,
            };

            // Validate required fields
            if (!dto.documentType || !dto.fileName || !dto.contentType) {
                res.status(400).json({ message: 'Missing required fields: documentType, fileName, contentType' });
                return;
            }

            const result = await this.generateUploadUrlUseCase.execute(dto);

            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            } else {
                res.status(400).json({ message: result.error });
            }
        } catch (error) {
            console.error('Error generating upload URL:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    public async completeUpload(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const dto: CompleteKycUploadDto = {
                userId,
                documentType: req.body.documentType,
                fileKey: req.body.fileKey,
                documentTypeName: req.body.documentTypeName,
                documentNumber: req.body.documentNumber,
                address: req.body.address,
            };

            // Validate required fields
            if (!dto.documentType || !dto.fileKey) {
                res.status(400).json({ message: 'Missing required fields: documentType, fileKey' });
                return;
            }

            const result = await this.completeKycUploadUseCase.execute(dto);

            if (result.isSuccess) {
                res.status(200).json({ message: 'Document upload completed successfully' });
            } else {
                res.status(400).json({ message: result.error });
            }
        } catch (error) {
            console.error('Error completing upload:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    public async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await this.getKycStatusUseCase.execute(userId);

            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            } else {
                res.status(404).json({ message: result.error });
            }
        } catch (error) {
            console.error('Error fetching KYC status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    public async submitKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await this.submitKycUseCase.execute(userId);

            if (result.isSuccess) {
                res.status(200).json({ message: 'KYC submitted successfully' });
            } else {
                res.status(400).json({ message: result.error });
            }
        } catch (error) {
            console.error('Error submitting KYC:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
