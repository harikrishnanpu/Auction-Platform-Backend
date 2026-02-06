import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserRole } from "../../../domain/user/user.entity";
import { IKYCRepository, KYCType, KYCStatus } from "../../../domain/kyc/kyc.repository";

export class VerifySellerKycUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    public async execute(
        userId: string,
        verify: boolean,
        reasonType?: string,
        reasonMessage?: string
    ): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        // Update KYC status
        const kycProfile = await this.kycRepository.findByUserId(userId, KYCType.SELLER);

        if (!kycProfile) {
            return Result.fail("KYC profile not found");
        }

        if (verify && kycProfile.verification_status === KYCStatus.VERIFIED) {
            return Result.fail("KYC is already verified");
        }

        if (!verify && kycProfile.verification_status === KYCStatus.REJECTED) {
            return Result.fail("KYC is already rejected");
        }

        const normalizedReasonType = reasonType?.trim();
        const normalizedReasonMessage = reasonMessage?.trim();

        if (!verify) {
            if (!normalizedReasonType) {
                return Result.fail("Rejection reason type is required");
            }
            if (!normalizedReasonMessage) {
                return Result.fail("Rejection reason message is required");
            }
        }

        await this.kycRepository.updateStatus(
            kycProfile.kyc_id,
            verify ? KYCStatus.VERIFIED : KYCStatus.REJECTED,
            verify ? null : normalizedReasonType || null,
            verify ? null : normalizedReasonMessage || null,
            verify ? null : new Date()
        );

        // If verifying, ensure user has SELLER role
        if (verify && !user.roles.includes(UserRole.SELLER)) {
            user.addRole(UserRole.SELLER);
            await this.userRepository.save(user);
        }

        return Result.ok<void>(undefined);
    }
}
