import { Result } from "../../../domain/shared/result";
import { AdminStatsDto } from "../../dtos/admin/admin.dto";
import prisma from "../../../utils/prismaClient";

export class GetAdminStatsUseCase {
    constructor() { }

    public async execute(): Promise<Result<AdminStatsDto>> {
        try {
            const [totalUsers, pendingKyc, activeSellers, suspendedUsers] = await Promise.all([
                prisma.user.count(),
                prisma.kYCProfile.count({
                    where: { verification_status: 'PENDING' }
                }),
                prisma.user.count({
                    where: {
                        UserRole: {
                            some: { role: 'SELLER' }
                        },
                        is_blocked: false
                    }
                }),
                prisma.user.count({
                    where: { is_blocked: true }
                })
            ]);

            return Result.ok<AdminStatsDto>({
                totalUsers,
                pendingKyc,
                activeSellers,
                suspendedUsers
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return Result.fail('Failed to fetch admin stats');
        }
    }
}
