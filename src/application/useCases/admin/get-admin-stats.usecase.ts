import { Result } from "../../../domain/shared/result";
import { AdminStatsDto } from "../../dtos/admin/admin.dto";
import { IUserRepository } from "../../../domain/user/user.repository";
import { IKYCRepository } from "../../../domain/kyc/kyc.repository";

export class GetAdminStatsUseCase {
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
            console.log('Error fetching:', error);
            return Result.fail('Failed to fetch admin stats');
        }
    }
}
