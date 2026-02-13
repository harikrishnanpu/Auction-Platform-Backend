import { User } from "@domain/entities/user/user.entity";
import { IUserRepository } from "@domain/repositories/user.repository";
import { Email } from "@domain/value-objects/user/email.vo";
import { Phone } from "@domain/value-objects/user/phone.vo";
import { UserMapper } from "../../mappers/user.mapper";
import prisma from "utils/prismaClient";

export class PrismaUserRepository implements IUserRepository {

    async save(user: User): Promise<void> {

        const data = {
            name: user.name,
            email: user.email.getValue(),
            phone: user.phone?.getValue() ?? null,
            address: user.address,
            avatar_url: user.avatar_url ?? null,
            password_hash: user.password?.getValue() ?? null,
            google_id: user.googleId ?? null,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            updated_at: new Date(),
        };

        if (!user.id) {
            await prisma.user.create({
                data: {
                    ...data,
                    created_at: user.created_at,
                    UserRole: {
                        create: user.roles.map(role => ({
                            role
                        }))
                    }
                }
            });
        } else {
            await prisma.user.update({
                where: { user_id: user.id },
                data: {
                    ...data,
                    UserRole: {
                        deleteMany: {},
                        create: user.roles.map(role => ({ role }))
                    }
                }
            });
        }
    }


    async findById(id: string): Promise<User | null> {

        const user = await prisma.user.findUnique({
            where: { user_id: id },
            include: {
                UserRole: true
            }
        });

        return user ? UserMapper.toDomain(user).getValue() : null;
    }

    async findByEmail(email: Email): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email: email.getValue() },
            include: {
                UserRole: true
            }
        });

        return user ? UserMapper.toDomain(user).getValue() : null;
    }

    async findByPhone(phone: Phone): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { phone: phone.getValue() },
            include: {
                UserRole: true
            }
        });

        return user ? UserMapper.toDomain(user).getValue() : null;
    }


    async findByPhoneOrEmail(phone: Phone, email: Email): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phone.getValue() },
                    { email: email.getValue() }
                ]
            },
            include: {
                UserRole: true
            }
        });

        return user ? UserMapper.toDomain(user).getValue() : null;
    }


    async findByGoogleId(googleId: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { google_id: googleId },
            include: {
                UserRole: true
            }
        });

        return user ? UserMapper.toDomain(user).getValue() : null;
    }

    async findAll(page: number, limit: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ users: User[], total: number }> {
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { created_at: 'desc' },
                include: { UserRole: true }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users: users.map(u => UserMapper.toDomain(u).getValue()),
            total
        };
    }

    async findSellers(page: number, limit: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', kycStatus?: string): Promise<{ sellers: User[], total: number }> {
        const where: any = {
            UserRole: { some: { role: 'SELLER' } }
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (kycStatus) {
            where.Kyc = {
                some: {
                    verification_status: kycStatus
                }
            };
        }

        const [sellers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { created_at: 'desc' },
                include: { UserRole: true }
            }),
            prisma.user.count({ where })
        ]);

        return {
            sellers: sellers.map(u => UserMapper.toDomain(u).getValue()),
            total
        };
    }

    async countAll(): Promise<number> {
        return prisma.user.count();
    }

    async countSellers(): Promise<number> {
        return prisma.user.count({
            where: { UserRole: { some: { role: 'SELLER' } } }
        });
    }

    async countBlocked(): Promise<number> {
        return prisma.user.count({
            where: { is_blocked: true }
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { user_id: id }
        });
    }
}
