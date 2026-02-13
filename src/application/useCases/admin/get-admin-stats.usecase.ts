import { Result } from "@result/result";
import { AdminStatsDto } from "@application/dtos/admin/admin.dto";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IKYCRepository } from "@domain/entities/kyc/kyc.repository";
import { IGetAdminStatsUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class GetAdminStatsUseCase implements IGetAdminStatsUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kycRepository: IKYCRepository
    ) { }

    public async execute(): Promise<Result<AdminStatsDto>> {
        try {
            const [totalUsers, pendingKyc, activeSellers, suspendedUsers] = await Promise.all([
                this.userRepository.countAll(),
                this.kycRepository.countPending(),
                this.userRepository.countSellers(),
                this.userRepository.countBlocked()
            ]);

            return Result.ok<AdminStatsDto>({
                totalUsers,
                pendingKyc,
                activeSellers,
                suspendedUsers
            });
        } catch (error) {
            return Result.fail((error as Error).message || 'Failed to fetch admin stats');
        }
    }
}
