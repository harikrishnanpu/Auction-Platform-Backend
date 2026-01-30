"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const user_mapper_1 = require("../database/prisma/user.mapper");
class PrismaUserRepository {
    async save(user) {
        const raw = user_mapper_1.UserMapper.toPersistence(user);
        const roles = user.roles.map(r => ({ role: r }));
        await prismaClient_1.default.user.upsert({
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
    async findByEmail(email) {
        const raw = await prismaClient_1.default.user.findUnique({
            where: { email: email.value },
            include: { UserRole: true }
        });
        if (!raw)
            return null;
        const user = user_mapper_1.UserMapper.toDomain(raw);
        if (user.isFailure)
            return null;
        return user.getValue();
    }
    async findById(id) {
        const raw = await prismaClient_1.default.user.findUnique({
            where: { user_id: id.value },
            include: { UserRole: true }
        });
        if (!raw)
            return null;
        const userOrError = user_mapper_1.UserMapper.toDomain(raw);
        if (userOrError.isFailure)
            return null;
        return userOrError.getValue();
    }
    async findAll(page, limit, search, sortBy, sortOrder = 'desc') {
        const skip = (page - 1) * limit;
        const where = {
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
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder;
        }
        else {
            orderBy.created_at = 'desc';
        }
        const [rawUsers, total] = await Promise.all([
            prismaClient_1.default.user.findMany({
                where,
                skip,
                take: limit,
                include: { UserRole: true },
                orderBy
            }),
            prismaClient_1.default.user.count({ where })
        ]);
        const users = [];
        for (const raw of rawUsers) {
            const userOrError = user_mapper_1.UserMapper.toDomain(raw);
            if (userOrError.isSuccess) {
                users.push(userOrError.getValue());
            }
        }
        return { users, total };
    }
    async emailExists(email) {
        const count = await prismaClient_1.default.user.count({
            where: { email: email.value }
        });
        return count > 0;
    }
    async phoneExists(phone) {
        const count = await prismaClient_1.default.user.count({
            where: { phone }
        });
        return count > 0;
    }
    async findByGoogleId(googleId) {
        const raw = await prismaClient_1.default.user.findUnique({
            where: { google_id: googleId },
            include: { UserRole: true }
        });
        if (!raw)
            return null;
        const user = user_mapper_1.UserMapper.toDomain(raw);
        if (user.isFailure)
            return null;
        return user.getValue();
    }
    async delete(id) {
        await prismaClient_1.default.user.delete({
            where: { user_id: id.value }
        });
    }
    async countAll() {
        return prismaClient_1.default.user.count();
    }
    async countSellers() {
        return prismaClient_1.default.user.count({
            where: {
                UserRole: {
                    some: { role: 'SELLER' }
                },
                is_blocked: false
            }
        });
    }
    async countBlocked() {
        return prismaClient_1.default.user.count({
            where: { is_blocked: true }
        });
    }
    async findSellers(page, limit) {
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                {
                    UserRole: {
                        some: { role: 'SELLER' }
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
        };
        const [rawUsers, total] = await Promise.all([
            prismaClient_1.default.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    UserRole: true,
                    KYCProfile: {
                        where: { kyc_type: 'SELLER' },
                        orderBy: { updated_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prismaClient_1.default.user.count({ where })
        ]);
        const sellers = rawUsers.map(user => ({
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.UserRole.map((r) => r.role),
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            kyc_status: user.KYCProfile.length > 0
                ? user.KYCProfile[0].verification_status
                : 'NOT_SUBMITTED',
            kyc_profile: user.KYCProfile.length > 0 ? user.KYCProfile[0] : null,
            joined_at: user.created_at
        }));
        return { sellers, total };
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
