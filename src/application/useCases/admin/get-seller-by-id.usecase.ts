import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserRole } from "../../../domain/user/user.entity";
import { IKYCRepository, KYCType } from "../../../domain/kyc/kyc.repository";

export interface SellerDetailDto {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address: string;
    avatar_url?: string;
    roles: string[];
    is_active: boolean;
    is_blocked: boolean;
    is_verified: boolean;
    joined_at: Date;
    kyc_status: string;
    kyc_profile: any;
}

import { IStorageService } from "../../services/storage/storage.service";

export class GetSellerByIdUseCase {
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
        const user = await this.userRepository.findById(id);
        if (!user) return Result.fail("User not found");

        const hasSellerRole = user.roles.includes(UserRole.SELLER);
        const kycProfile = await this.kycRepository.findByUserId(id, KYCType.SELLER);

        if (!hasSellerRole && (!kycProfile || kycProfile.verification_status !== 'PENDING')) {
            return Result.fail("User is not a seller and has no pending seller KYC");
        }

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
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.roles,
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            joined_at: user.created_at,
            kyc_status: kycProfile?.verification_status || 'NOT_SUBMITTED',
            kyc_profile: kycProfile
        });
    }
}
