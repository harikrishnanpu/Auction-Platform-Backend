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
                    OR: [
                        {
                            UserRole: {
                                some: {
                                    role: 'SELLER'
                                }
                            }
                        },
                        {
                            KYCProfile: {
                                some: {
                                    kyc_type: 'SELLER',
                                    verification_status: 'PENDING'
                                }
                            }
                        }
                    ]
                },
                skip,
                take: limit,
                include: {
                    UserRole: true,
                    KYCProfile: {
                        where: {
                            kyc_type: 'SELLER'
                        } as any,
                        orderBy: {
                            updated_at: 'desc'
                        },
                        take: 1
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({
                where: {
                    OR: [
                        {
                            UserRole: {
                                some: {
                                    role: 'SELLER'
                                }
                            }
                        },
                        {
                            KYCProfile: {
                                some: {
                                    kyc_type: 'SELLER',
                                    verification_status: 'PENDING'
                                }
                            }
                        }
                    ]
                }
            })
        ]);

        const sellers = (rawUsers as any[]).map(user => ({
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.UserRole.map((r: any) => r.role),
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            kyc_status: user.KYCProfile.length > 0
                ? (user.KYCProfile[0] as any).verification_status
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
