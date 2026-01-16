import { IUserRepository } from '../../../domain/user/user.repository';
import { Result } from '../../../domain/shared/result';
import { UserId } from '../../../domain/user/user-id.vo';
import prisma from '../../../utils/prismaClient';

export class SubmitKycUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string): Promise<Result<void>> {
        const userIdOrError = UserId.create(userId);
        if (userIdOrError.isFailure) {
            return Result.fail('Invalid user ID');
        }

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) {
            return Result.fail('User not found');
        }

        const kycProfile = await prisma.kYCProfile.findFirst({
            where: { user_id: userId }
        });

        if (!kycProfile) {
            return Result.fail('KYC profile not found. Please upload documents first.');
        }

        // Validate that necessary documents are present before submission
        if (!kycProfile.id_front_url || !kycProfile.id_back_url || !kycProfile.address_proof_url) {
            return Result.fail('Please upload all required documents (ID Front, ID Back, Address Proof) before submitting.');
        }

        // If already verified, don't change
        if (kycProfile.verification_status === 'VERIFIED') {
            return Result.fail('KYC is already verified.');
        }

        await prisma.kYCProfile.update({
            where: { kyc_id: kycProfile.kyc_id },
            data: {
                verification_status: 'PENDING',
                kyc_type: 'SELLER', // Explicitly setting it here if needed, or keeping it as is
                updated_at: new Date()
            }
        });

        return Result.ok<void>(undefined);
    }
}
