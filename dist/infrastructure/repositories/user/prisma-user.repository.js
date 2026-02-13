"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const user_mapper_1 = require("@infrastructure/mappers/user.mapper");
const prismaClient_1 = __importDefault(require("utils/prismaClient"));
class PrismaUserRepository {
    async save(user) {
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
            await prismaClient_1.default.user.create({
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
        }
        else {
            await prismaClient_1.default.user.update({
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
    async findById(id) {
        const user = await prismaClient_1.default.user.findUnique({
            where: { user_id: id },
            include: {
                UserRole: true
            }
        });
        return user ? user_mapper_1.UserMapper.toDomain(user).getValue() : null;
    }
    async findByEmail(email) {
        const user = await prismaClient_1.default.user.findUnique({
            where: { email: email.getValue() },
            include: {
                UserRole: true
            }
        });
        return user ? user_mapper_1.UserMapper.toDomain(user).getValue() : null;
    }
    async findByPhone(phone) {
        const user = await prismaClient_1.default.user.findUnique({
            where: { phone: phone.getValue() },
            include: {
                UserRole: true
            }
        });
        return user ? user_mapper_1.UserMapper.toDomain(user).getValue() : null;
    }
    async findByPhoneOrEmail(phone, email) {
        const user = await prismaClient_1.default.user.findFirst({
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
        return user ? user_mapper_1.UserMapper.toDomain(user).getValue() : null;
    }
    async findByGoogleId(googleId) {
        const user = await prismaClient_1.default.user.findUnique({
            where: { google_id: googleId },
            include: {
                UserRole: true
            }
        });
        return user ? user_mapper_1.UserMapper.toDomain(user).getValue() : null;
    }
    async findAll(page, limit, search, sortBy, sortOrder) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            prismaClient_1.default.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { created_at: 'desc' },
                include: { UserRole: true }
            }),
            prismaClient_1.default.user.count({ where })
        ]);
        return {
            users: users.map(u => user_mapper_1.UserMapper.toDomain(u).getValue()),
            total
        };
    }
    async findSellers(page, limit, search, sortBy, sortOrder, kycStatus) {
        const where = {
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
            prismaClient_1.default.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { created_at: 'desc' },
                include: { UserRole: true }
            }),
            prismaClient_1.default.user.count({ where })
        ]);
        return {
            sellers: sellers.map(u => user_mapper_1.UserMapper.toDomain(u).getValue()),
            total
        };
    }
    async countAll() {
        return prismaClient_1.default.user.count();
    }
    async countSellers() {
        return prismaClient_1.default.user.count({
            where: { UserRole: { some: { role: 'SELLER' } } }
        });
    }
    async countBlocked() {
        return prismaClient_1.default.user.count({
            where: { is_blocked: true }
        });
    }
    async delete(id) {
        await prismaClient_1.default.user.delete({
            where: { user_id: id }
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
