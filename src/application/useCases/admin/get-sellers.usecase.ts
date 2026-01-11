import { IUserRepository } from "../../../domain/user/user.repository";
import { UserListResponseDto } from "../../dtos/admin/admin.dto";
import { Result } from "../../../domain/shared/result";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import prisma from "../../../utils/prismaClient";

export class GetSellersUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(page: number, limit: number): Promise<Result<UserListResponseDto & { sellers: any[] }>> {
        const skip = (page - 1) * limit;
        
        const [rawUsers, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    UserRole: {
                        some: {
                            role: 'SELLER'
                        }
                    }
                },
                skip,
                take: limit,
                include: { 
                    UserRole: true,
                    KYCProfile: true
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({
                where: {
                    UserRole: {
                        some: {
                            role: 'SELLER'
                        }
                    }
                }
            })
        ]);

        const sellers = rawUsers.map(user => ({
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.UserRole.map(r => r.role),
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            kyc_status: user.KYCProfile.length > 0 
                ? user.KYCProfile[0].verification_status 
                : 'NOT_SUBMITTED',
            kyc_profile: user.KYCProfile.length > 0 ? user.KYCProfile[0] : null,
            joined_at: user.created_at
        }));

        return Result.ok({
            sellers,
            users: sellers as any,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
