"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuctionActivityRepository = void 0;
class PrismaAuctionActivityRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logActivity(auctionId, activityType, description, userId, metadata) {
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
    async getRecentActivities(auctionId, limit) {
        const activities = await this.prisma.auctionActivity.findMany({
            where: { auction_id: auctionId },
            orderBy: { created_at: 'desc' },
            take: limit
        });
        return activities.map(a => this.map(a));
    }
    map(activity) {
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
exports.PrismaAuctionActivityRepository = PrismaAuctionActivityRepository;
