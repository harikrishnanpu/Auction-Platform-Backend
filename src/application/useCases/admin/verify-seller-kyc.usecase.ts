import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { UserRole } from "@domain/entities/user/user.entity";
import { IKYCRepository, KYCType, KYCStatus } from "@domain/entities/kyc/kyc.repository";
import { IVerifySellerKycUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class VerifySellerKycUseCase implements IVerifySellerKycUseCase {
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
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) return Result.fail("User not found");

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

            if (verify && !user.roles.includes(UserRole.SELLER)) {
                user.addRole(UserRole.SELLER);
                await this.userRepository.save(user);
            }

            return Result.ok<void>(undefined);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
