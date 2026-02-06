import { KYCType } from "../../../domain/kyc/kyc.repository";

export interface GenerateUploadUrlDto {
    userId: string;
    documentType: 'id_front' | 'id_back' | 'address_proof';
    fileName: string;
    contentType: string;
    kycType?: KYCType;
}

export interface UploadUrlResponseDto {
    uploadUrl: string;
    fileKey: string;
    expiresIn: number;
}

export interface CompleteKycUploadDto {
    userId: string;
    documentType: 'id_front' | 'id_back' | 'address_proof';
    fileKey: string;
    kycType?: KYCType;
    documentTypeName?: string;
    documentNumber?: string;
    address?: string;
}

