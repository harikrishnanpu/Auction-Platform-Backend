"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCriticalUserRepository = void 0;
class PrismaCriticalUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const record = await this.prisma.criticalUser.create({
            data: {
                user_id: data.userId,
                auction_id: data.auctionId || null,
                reason: data.reason,
                description: data.description || null,
                severity: data.severity || 'HIGH',
                resolved: false
            }
        });
        return this.toDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.criticalUser.findUnique({
            where: { id }
        });
        return record ? this.toDomain(record) : null;
    }
    async findByUserId(userId) {
        const records = await this.prisma.criticalUser.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        return records.map(r => this.toDomain(r));
    }
    async findUnresolvedByUser(userId) {
        const records = await this.prisma.criticalUser.findMany({
            where: {
                user_id: userId,
                resolved: false
            },
            orderBy: { created_at: 'desc' }
        });
        return records.map(r => this.toDomain(r));
    }
    async update(id, data) {
        const record = await this.prisma.criticalUser.update({
            where: { id },
            data: {
                resolved: data.resolved,
                resolved_at: data.resolvedAt,
                description: data.description
            }
        });
        return this.toDomain(record);
    }
    async markUserAsCritical(userId) {
        await this.prisma.user.update({
            where: { user_id: userId },
            data: { is_critical: true }
        });
    }
    async delete(id) {
        await this.prisma.criticalUser.delete({
            where: { id }
        });
    }
    toDomain(record) {
        return {
            id: record.id,
            userId: record.user_id,
            auctionId: record.auction_id,
            reason: record.reason,
            description: record.description,
            severity: record.severity,
            resolved: record.resolved,
            resolvedAt: record.resolved_at,
            createdAt: record.created_at,
            updatedAt: record.updated_at
        };
    }
}
exports.PrismaCriticalUserRepository = PrismaCriticalUserRepository;
