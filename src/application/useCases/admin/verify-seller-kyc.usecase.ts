import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserRole } from "../../../domain/user/user.entity";
import { IKYCRepository, KYCType, KYCStatus } from "../../../domain/kyc/kyc.repository";

export class VerifySellerKycUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    public async execute(userId: string, verify: boolean): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        // Update KYC status
        const kycProfile = await this.kycRepository.findByUserId(userId, KYCType.SELLER);

        if (!kycProfile) {
            return Result.fail("KYC profile not found");
        }

        await this.kycRepository.updateStatus(
            kycProfile.kyc_id,
            verify ? KYCStatus.VERIFIED : KYCStatus.REJECTED
        );

        // If verifying, ensure user has SELLER role
        if (verify && !user.roles.includes(UserRole.SELLER)) {
            user.addRole(UserRole.SELLER);
            await this.userRepository.save(user);
        }

        return Result.ok<void>(undefined);
    }
}
