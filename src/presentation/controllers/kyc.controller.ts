import { Request, Response } from 'express';
import { GenerateUploadUrlUseCase } from '../../application/useCases/kyc/generate-upload-url.usecase';
import { CompleteKycUploadUseCase } from '../../application/useCases/kyc/complete-kyc-upload.usecase';
import { SubmitKycUseCase } from '../../application/useCases/kyc/submit-kyc.usecase';
import { GenerateUploadUrlDto, CompleteKycUploadDto } from '../../application/dtos/kyc/kyc.dto';
import { GetKycStatusUseCase } from '../../application/useCases/kyc/get-kyc-status.usecase';
import { HttpStatus } from '../../application/constants/http-status.constants';
import { ResponseMessages } from '../../application/constants/response.messages';

export class KycController {
    constructor(
        private generateUploadUrlUseCase: GenerateUploadUrlUseCase,
        private completeKycUploadUseCase: CompleteKycUploadUseCase,
        private getKycStatusUseCase: GetKycStatusUseCase,
        private submitKycUseCase: SubmitKycUseCase
    ) { }

    public generateUploadUrl = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const dto: GenerateUploadUrlDto = {
                userId,
                documentType: req.body.documentType,
                fileName: req.body.fileName,
                contentType: req.body.contentType,
            };


            if (!dto.documentType || !dto.fileName || !dto.contentType) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: ResponseMessages.KYC_MISSING_FIELDS });
                return;
            }

            const result = await this.generateUploadUrlUseCase.execute(dto);

            if (result.isSuccess) {
                res.status(HttpStatus.OK).json(result.getValue());
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        } catch (error) {
            console.log('Error generating upload URL:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    public completeUpload = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
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

            if (!dto.documentType || !dto.fileKey) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: ResponseMessages.KYC_MISSING_UPLOAD_FIELDS });
                return;
            }

            const result = await this.completeKycUploadUseCase.execute(dto);

            if (result.isSuccess) {
                res.status(HttpStatus.OK).json({ message: ResponseMessages.KYC_UPLOAD_SUCCESS });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        } catch (error) {
            console.log('Error completing upload:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    public getStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const result = await this.getKycStatusUseCase.execute(userId);

            if (result.isSuccess) {
                res.status(HttpStatus.OK).json(result.getValue());
            } else {
                res.status(HttpStatus.NOT_FOUND).json({ message: result.error });
            }
        } catch (error) {
            console.log('Error fetching KYC status:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }

    public submitKyc = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const result = await this.submitKycUseCase.execute(userId);

            if (result.isSuccess) {
                res.status(HttpStatus.OK).json({ message: ResponseMessages.KYC_SUBMITTED_SUCCESS });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        } catch (error) {
            console.error('Error submitting KYC:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }
}

