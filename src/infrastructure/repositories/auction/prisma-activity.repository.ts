import { PrismaClient } from "@prisma/client";
import { ActivityEntity, IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";

export class PrismaAuctionActivityRepository implements IAuctionActivityRepository {
    constructor(private prisma: PrismaClient) {}

    async logActivity(
        auctionId: string,
        activityType: string,
        description: string,
        userId?: string,
        metadata?: any
    ): Promise<ActivityEntity> {
        const activity = await this.prisma.auctionActivity.create({
            data: {
                auction_id: auctionId,
                user_id: userId || null,
                activity_type: activityType,
                description,
                metadata: metadata || null
            }
        });
        return this.map(activity);
    }

    async getRecentActivities(auctionId: string, limit: number): Promise<ActivityEntity[]> {
        const activities = await this.prisma.auctionActivity.findMany({
            where: { auction_id: auctionId },
            orderBy: { created_at: 'desc' },
            take: limit
        });
        return activities.map(a => this.map(a));
    }

    private map(activity: any): ActivityEntity {
        return {
            id: activity.id,
            auctionId: activity.auction_id,
            userId: activity.user_id,
            activityType: activity.activity_type,
            description: activity.description,
            metadata: activity.metadata,
            createdAt: activity.created_at
        };
    }
}
