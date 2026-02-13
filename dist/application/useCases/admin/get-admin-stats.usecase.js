"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdminStatsUseCase = void 0;
const result_1 = require("@result/result");
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
            return result_1.Result.fail(error.message || 'Failed to fetch admin stats');
        }
    }
}
exports.GetAdminStatsUseCase = GetAdminStatsUseCase;
