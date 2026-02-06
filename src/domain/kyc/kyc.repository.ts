export enum KYCStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED'
}

export enum KYCType {
    SELLER = 'SELLER',
    MODERATOR = 'MODERATOR'
}

export interface KYCProfile {
    kyc_id: string;
    user_id: string;
    kyc_type: KYCType;
    document_type: string;
    document_number: string;
    address?: string | null;
    verification_status: string;
    rejection_reason_type?: string | null;
    rejection_reason_message?: string | null;
    rejected_at?: Date | null;
    id_front_url?: string | null;
    id_back_url?: string | null;
    address_proof_url?: string | null;
    updated_at: Date;
}

export interface IKYCRepository {
    findByUserId(userId: string, type?: KYCType): Promise<KYCProfile | null>;
    save(kyc: Partial<KYCProfile> & { user_id: string }): Promise<KYCProfile>;
    updateStatus(
        kycId: string,
        status: string,
        reasonType?: string | null,
        reasonMessage?: string | null,
        rejectedAt?: Date | null
    ): Promise<void>;
    countPending(): Promise<number>;
}
