import { IUserRepository } from "../../domain/user/user.repository";
import { User } from "../../domain/user/user.entity";
import { Email } from "../../domain/user/email.vo";
import prisma from "../../utils/prismaClient";
import { UserMapper } from "../database/prisma/user.mapper";
import { Phone } from "../../domain/user/phone.vo";

export class PrismaUserRepository implements IUserRepository {
    async save(user: User): Promise<void> {
        const raw = UserMapper.toPersistence(user);
        const roles = user.roles.map(r => ({ role: r as any }));

        await prisma.user.upsert({
            where: { user_id: raw.user_id },
            update: {
                name: raw.name,
                email: raw.email,
                phone: raw.phone,
                address: raw.address,
                avatar_url: raw.avatar_url,
                password_hash: raw.password_hash,
                is_active: raw.is_active,
                is_blocked: raw.is_blocked,
                is_verified: raw.is_verified,
                UserRole: {
                    deleteMany: {},
                    create: roles
                }
            },
            create: {
                user_id: raw.user_id,
                name: raw.name,
                email: raw.email,
                phone: raw.phone,
                address: raw.address,
                avatar_url: raw.avatar_url,
                password_hash: raw.password_hash,
                is_active: raw.is_active,
                is_blocked: raw.is_blocked,
                is_verified: raw.is_verified,
                updated_at: raw.updated_at,
                created_at: raw.created_at,
                UserRole: {
                    create: roles
                }
            }
        });
    }

    async findByEmail(email: Email): Promise<User | null> {
        const raw = await prisma.user.findUnique({
            where: { email: email.value },
            include: { UserRole: true }
        });

        if (!raw) return null;

        const user = UserMapper.toDomain(raw as any);

        if (user.isFailure) return null;
        return user.getValue();
    }

    async findById(id: string): Promise<User | null> {
        const raw = await prisma.user.findUnique({
            where: { user_id: id },
            include: { UserRole: true }
        });

        if (!raw) return null;

        const userOrError = UserMapper.toDomain(raw);
        if (userOrError.isFailure) return null;

        return userOrError.getValue();
    }

    async findAll(page: number, limit: number, search?: string, sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Promise<{ users: User[], total: number }> {
        const skip = (page - 1) * limit;

        const where: any = {
            UserRole: {
                none: {
                    role: 'ADMIN'
                }
            }
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder;
        } else {
            orderBy.created_at = 'desc';
        }

        const [rawUsers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { UserRole: true },
                orderBy
            }),
            prisma.user.count({ where })
        ]);

        const users: User[] = [];
        for (const raw of rawUsers) {
            const userOrError = UserMapper.toDomain(raw as any);
            if (userOrError.isSuccess) {
                users.push(userOrError.getValue());
            }
        }

        return { users, total };
    }

    async emailExists(email: Email): Promise<boolean> {
        const count = await prisma.user.count({
            where: { email: email.value }
        });
        return count > 0;
    }



    async phoneExists(phone: Phone): Promise<boolean> {
        const count = await prisma.user.count({
            where: { phone: phone.value }
        });
        return count > 0;
    }


    async findByGoogleId(googleId: string): Promise<User | null> {
        const raw = await prisma.user.findUnique({
            where: { google_id: googleId },
            include: { UserRole: true }
        });

        if (!raw) return null;

        const user = UserMapper.toDomain(raw as any);
        if (user.isFailure) return null;
        return user.getValue();
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { user_id: id }
        });
    }

    async countAll(): Promise<number> {
        return prisma.user.count();
    }

    async countSellers(): Promise<number> {
        return prisma.user.count({
            where: {
                UserRole: {
                    some: { role: 'SELLER' }
                },
                is_blocked: false
            }
        });
    }

    async countBlocked(): Promise<number> {
        return prisma.user.count({
            where: { is_blocked: true }
        });
    }

    async findSellers(page: number, limit: number): Promise<{ sellers: any[], total: number }> {
        const skip = (page - 1) * limit;

        const where = {
            OR: [
                {
                    UserRole: {
                        some: { role: 'SELLER' as any }
                    }
                },
                {
                    KYCProfile: {
                        some: {
                            kyc_type: 'SELLER' as any,
                            verification_status: 'PENDING'
                        }
                    }
                }
            ]
        };

        const [rawUsers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    UserRole: true,
                    KYCProfile: {
                        where: { kyc_type: 'SELLER' as any },
                        orderBy: { updated_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({ where })
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

        return { sellers, total };
    }
}
