"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdminStatsUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class GetAdminStatsUseCase {
    constructor(userRepository, kycRepository) {
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
    }
    async execute() {
        try {
            const [totalUsers, pendingKyc, activeSellers, suspendedUsers] = await Promise.all([
                this.userRepository.countAll(),
                this.kycRepository.countPending(),
                this.userRepository.countSellers(),
                this.userRepository.countBlocked()
            ]);
            return result_1.Result.ok({
                totalUsers,
                pendingKyc,
                activeSellers,
                suspendedUsers
            });
        }
        catch (error) {
            console.log('Error fetching:', error);
            return result_1.Result.fail('Failed to fetch admin stats');
        }
    }
}
exports.GetAdminStatsUseCase = GetAdminStatsUseCase;
