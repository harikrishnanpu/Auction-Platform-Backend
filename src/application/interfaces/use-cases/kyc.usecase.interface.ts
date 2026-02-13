import { Result } from "@result/result";
import { GenerateUploadUrlDto, CompleteKycUploadDto } from "@application/dtos/kyc/kyc.dto";
import { KYCType } from "@domain/entities/kyc/kyc.repository";

export interface IGenerateUploadUrlUseCase {
    execute(dto: GenerateUploadUrlDto): Promise<Result<any>>;
}

export interface ICompleteKycUploadUseCase {
    execute(dto: CompleteKycUploadDto): Promise<Result<void>>;
}

export interface IGetKycStatusUseCase {
    execute(userId: string, kycType?: KYCType): Promise<Result<any>>;
}

export interface ISubmitKycUseCase {
    execute(userId: string, kycType?: KYCType): Promise<Result<void>>;
}
