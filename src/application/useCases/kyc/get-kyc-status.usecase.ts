import { IUserRepository } from '@domain/repositories/user.repository';
import { Result } from '@result/result';
import { IKYCRepository, KYCType } from '@domain/entities/kyc/kyc.repository';
import { IGetKycStatusUseCase } from '@application/interfaces/use-cases/kyc.usecase.interface';

export class GetKycStatusUseCase implements IGetKycStatusUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    async execute(userId: string, kycType: KYCType = KYCType.SELLER): Promise<Result<any>> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            return Result.fail('User not found');
        }

        const kycProfile = await this.kycRepository.findByUserId(userId, kycType);

        if (!kycProfile) {
            return Result.ok({ status: 'NOT_SUBMITTED', profile: null });
        }

        return Result.ok({ status: kycProfile.verification_status, profile: kycProfile });
    }
}
