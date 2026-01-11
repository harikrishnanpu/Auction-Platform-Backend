import { IUserRepository } from "../../domain/user/user.repository";
// Trigger restart
import { User } from "../../domain/user/user.entity";
import { Email } from "../../domain/user/email.vo";
import { UserId } from "../../domain/user/user-id.vo";
import prisma from "../../utils/prismaClient";
import { UserMapper } from "../database/prisma/user.mapper";

export class PrismaUserRepository implements IUserRepository {
    async save(user: User): Promise<void> {
        const raw = UserMapper.toPersistence(user);
        const roles = user.roles.map(r => ({ role: r as any })); // Map to Prisma Enum format

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
                assigned_at: raw.assigned_at,
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

        // Cast raw to include roles for Mapper
        const userOrError = UserMapper.toDomain(raw as any);
        if (userOrError.isFailure) return null;

        return userOrError.getValue();
    }

    async findById(id: UserId): Promise<User | null> {
        const raw = await prisma.user.findUnique({
            where: { user_id: id.value },
            include: { UserRole: true }
        });

        if (!raw) return null;

        const userOrError = UserMapper.toDomain(raw);
        if (userOrError.isFailure) return null;

        return userOrError.getValue();
    }

    async findAll(page: number, limit: number): Promise<{ users: User[], total: number }> {
        const skip = (page - 1) * limit;
        const [rawUsers, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                include: { UserRole: true },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count()
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

    async phoneExists(phone: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { phone }
        });
        return count > 0;
    }
}
