import { IUserRepository } from '../../../domain/user/user.repository';
import { Result } from '../../../domain/shared/result';
import { UserId } from '../../../domain/user/user-id.vo';
import prisma from '../../../utils/prismaClient';

export class GetKycStatusUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string): Promise<Result<any>> {
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
            return Result.ok({ status: 'NOT_SUBMITTED', profile: null });
        }

        return Result.ok({ status: kycProfile.verification_status, profile: kycProfile });
    }
}
