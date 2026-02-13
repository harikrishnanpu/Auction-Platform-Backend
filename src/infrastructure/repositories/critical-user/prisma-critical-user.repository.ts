import { PrismaClient } from '@prisma/client';
import { ICriticalUserRepository } from '../../../domain/entities/critical-user/critical-user.repository';
import { CriticalUserEntity, CreateCriticalUserDTO, UpdateCriticalUserDTO } from '../../../domain/entities/critical-user/critical-user.entity';

export class PrismaCriticalUserRepository implements ICriticalUserRepository {
    constructor(private prisma: PrismaClient) { }

    async create(data: CreateCriticalUserDTO): Promise<CriticalUserEntity> {
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

    async findById(id: string): Promise<CriticalUserEntity | null> {
        const record = await this.prisma.criticalUser.findUnique({
            where: { id }
        });
        return record ? this.toDomain(record) : null;
    }

    async findByUserId(userId: string): Promise<CriticalUserEntity[]> {
        const records = await this.prisma.criticalUser.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        return records.map(r => this.toDomain(r));
    }

    async findUnresolvedByUser(userId: string): Promise<CriticalUserEntity[]> {
        const records = await this.prisma.criticalUser.findMany({
            where: {
                user_id: userId,
                resolved: false
            },
            orderBy: { created_at: 'desc' }
        });
        return records.map(r => this.toDomain(r));
    }

    async update(id: string, data: UpdateCriticalUserDTO): Promise<CriticalUserEntity> {
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

    async markUserAsCritical(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { user_id: userId },
            data: { is_critical: true }
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.criticalUser.delete({
            where: { id }
        });
    }

    private toDomain(record: any): CriticalUserEntity {
        return {
            id: record.id,
            userId: record.user_id,
            auctionId: record.auction_id,
            reason: record.reason,
            description: record.description,
            severity: record.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
            resolved: record.resolved,
            resolvedAt: record.resolved_at,
            createdAt: record.created_at,
            updatedAt: record.updated_at
        };
    }
}
