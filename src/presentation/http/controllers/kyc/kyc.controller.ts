import { Request, Response } from 'express';
import { GenerateUploadUrlDto, CompleteKycUploadDto } from 'application/dtos/kyc/kyc.dto';
import { KYCType } from 'domain/entities/kyc/kyc.repository';
import {
    IGenerateUploadUrlUseCase,
    ICompleteKycUploadUseCase,
    IGetKycStatusUseCase,
    ISubmitKycUseCase
} from 'application/interfaces/use-cases/kyc.usecase.interface';
import { STATUS_CODE } from 'constants/status.code';
import { AppError } from 'shared/app.error';
import expressAsyncHandler from 'express-async-handler';

export class KycController {
    constructor(
        private generateUploadUrlUseCase: IGenerateUploadUrlUseCase,
        private completeKycUploadUseCase: ICompleteKycUploadUseCase,
        private getKycStatusUseCase: IGetKycStatusUseCase,
        private submitKycUseCase: ISubmitKycUseCase
    ) { }

    private parseKycType(value?: string): KYCType | undefined {
        if (!value) return undefined;
        if (value === KYCType.SELLER || value === KYCType.MODERATOR) return value;
        return undefined;
    }

    public generateUploadUrl = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

        const kycType = this.parseKycType(req.body.kycType);
        if (req.body.kycType && !kycType) throw new AppError('Invalid kycType', STATUS_CODE.BAD_REQUEST);

        const dto: GenerateUploadUrlDto = {
            userId,
            documentType: req.body.documentType,
            fileName: req.body.fileName,
            contentType: req.body.contentType,
            kycType
        };

        if (!dto.documentType || !dto.fileName || !dto.contentType) {
            throw new AppError('Missing required fields', STATUS_CODE.BAD_REQUEST);
        }

        const result = await this.generateUploadUrlUseCase.execute(dto);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json(result.getValue());
    });

    public completeUpload = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

        const kycType = this.parseKycType(req.body.kycType);
        if (req.body.kycType && !kycType) throw new AppError('Invalid kycType', STATUS_CODE.BAD_REQUEST);

        const dto: CompleteKycUploadDto = {
            userId,
            documentType: req.body.documentType,
            fileKey: req.body.fileKey,
            documentTypeName: req.body.documentTypeName,
            documentNumber: req.body.documentNumber,
            address: req.body.address,
            kycType
        };

        if (!dto.documentType || !dto.fileKey) {
            throw new AppError('Missing required fields: documentType, fileKey', STATUS_CODE.BAD_REQUEST);
        }

        const result = await this.completeKycUploadUseCase.execute(dto);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: 'Document upload completed successfully' });
    });

    public getStatus = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

        const kycType = this.parseKycType(req.query.kycType as string | undefined) || KYCType.SELLER;

        const result = await this.getKycStatusUseCase.execute(userId); // Interface update needed if kycType is required
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.NOT_FOUND);

        res.status(STATUS_CODE.SUCCESS).json(result.getValue());
    });

    public submitKyc = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

        const result = await this.submitKycUseCase.execute(userId);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: 'KYC submitted successfully' });
    });
}
