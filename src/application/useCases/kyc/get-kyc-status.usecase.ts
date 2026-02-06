import { IUserRepository } from '../../../domain/user/user.repository';
import { Result } from '../../../domain/shared/result';
import { IKYCRepository } from '../../../domain/kyc/kyc.repository';

export class GetKycStatusUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    async execute(userId: string): Promise<Result<any>> {
        const user = await this.userRepository.findById(userId);


        if (!user) {
            return Result.fail('User not found');
        }

        const kycProfile = await this.kycRepository.findByUserId(userId);

        if (!kycProfile) {
            return Result.ok({ status: 'NOT_SUBMITTED', profile: null });
        }

        return Result.ok({ status: kycProfile.verification_status, profile: kycProfile });
    }
}
