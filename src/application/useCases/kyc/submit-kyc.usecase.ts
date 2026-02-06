import { IUserRepository } from '../../../domain/user/user.repository';
import { Result } from '../../../domain/shared/result';
import { IKYCRepository, KYCStatus, KYCType } from '../../../domain/kyc/kyc.repository';

export class SubmitKycUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    async execute(userId: string): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return Result.fail('User not found');
        }

        const kycProfile = await this.kycRepository.findByUserId(userId);

        if (!kycProfile) {
            return Result.fail('KYC profile not found. Please upload documents first.');
        }

        // Validate that necessary documents are present before submission
        if (!kycProfile.id_front_url || !kycProfile.id_back_url || !kycProfile.address_proof_url) {
            return Result.fail('Please upload all required documents (ID Front, ID Back, Address Proof) before submitting.');
        }

        // If already verified, don't change
        if (kycProfile.verification_status === KYCStatus.VERIFIED) {
            return Result.fail('KYC is already verified.');
        }

        await this.kycRepository.save({
            kyc_id: kycProfile.kyc_id,
            user_id: userId,
            verification_status: KYCStatus.PENDING,
            kyc_type: KYCType.SELLER
        });

        return Result.ok<void>(undefined);
    }
}
