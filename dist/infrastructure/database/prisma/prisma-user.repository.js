"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prismaClient_1 = __importDefault(require("../../../utils/prismaClient"));
const user_mapper_1 = require("./user.mapper");
class PrismaUserRepository {
    async save(user) {
        const raw = user_mapper_1.UserMapper.toPersistence(user);
        const roles = user.roles.map(r => ({ role: r })); // Map to Prisma Enum format
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
                roles: {
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
                roles: {
                    create: roles
                }
            }
        });
    }
    async findByEmail(email) {
        const raw = await prismaClient_1.default.user.findUnique({
            where: { email: email.value },
            include: { roles: true }
        });
        if (!raw)
            return null;
        // Cast raw to include roles for Mapper
        const userOrError = user_mapper_1.UserMapper.toDomain(raw);
        if (userOrError.isFailure)
            return null;
        return userOrError.getValue();
    }
    async findById(id) {
        const raw = await prismaClient_1.default.user.findUnique({
            where: { user_id: id.value },
            include: { roles: true }
        });
        if (!raw)
            return null;
        const userOrError = user_mapper_1.UserMapper.toDomain(raw);
        if (userOrError.isFailure)
            return null;
        return userOrError.getValue();
    }
    async findAll(page, limit) {
        const skip = (page - 1) * limit;
        const [rawUsers, total] = await Promise.all([
            prismaClient_1.default.user.findMany({
                skip,
                take: limit,
                include: { roles: true },
                orderBy: { created_at: 'desc' }
            }),
            prismaClient_1.default.user.count()
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
}
exports.PrismaUserRepository = PrismaUserRepository;
