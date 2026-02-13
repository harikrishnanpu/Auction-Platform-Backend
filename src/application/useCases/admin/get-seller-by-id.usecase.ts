import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { IKYCRepository, KYCType } from "@domain/entities/kyc/kyc.repository";
import { IStorageService } from "@application/services/storage/storage.service";
import { IGetSellerByIdUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export interface SellerDetailDto {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address: string;
    avatar_url?: string;
    roles: string[];
    is_blocked: boolean;
    is_verified: boolean;
    joined_at: Date;
    kyc_status: string;
    kyc_profile: any;
}

export class GetSellerByIdUseCase implements IGetSellerByIdUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository,
        private storageService: IStorageService
    ) { }

    private extractS3Key(value: string): string {
        if (!value) return value;
        if (!value.startsWith("http")) return value;
        const marker = ".amazonaws.com/";
        const markerIndex = value.indexOf(marker);
        if (markerIndex === -1) return value;
        return value.slice(markerIndex + marker.length);
    }

    public async execute(id: string): Promise<Result<SellerDetailDto>> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) return Result.fail("User not found");

            const kycProfile = await this.kycRepository.findByUserId(id, KYCType.SELLER);

            if (kycProfile) {
                if (kycProfile.id_front_url) {
                    const key = this.extractS3Key(kycProfile.id_front_url);
                    kycProfile.id_front_url = await this.storageService.getPresignedDownloadUrl(key);
                }
                if (kycProfile.id_back_url) {
                    const key = this.extractS3Key(kycProfile.id_back_url);
                    kycProfile.id_back_url = await this.storageService.getPresignedDownloadUrl(key);
                }
                if (kycProfile.address_proof_url) {
                    const key = this.extractS3Key(kycProfile.address_proof_url);
                    kycProfile.address_proof_url = await this.storageService.getPresignedDownloadUrl(key);
                }
            }

            return Result.ok<SellerDetailDto>({
                id: user.id || id,
                name: user.name,
                email: user.email.getValue(),
                phone: user.phone?.getValue(),
                address: user.address,
                avatar_url: user.avatar_url,
                roles: user.roles,
                is_blocked: user.is_blocked,
                is_verified: user.is_verified,
                joined_at: user.created_at,
                kyc_status: kycProfile?.verification_status || 'NOT_SUBMITTED',
                kyc_profile: kycProfile
            });
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
