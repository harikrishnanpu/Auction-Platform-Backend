export interface ActivityEntity {
    id: string;
    auctionId: string;
    userId?: string | null;
    activityType: string;
    description: string;
    metadata?: any;
    createdAt: Date;
}

export interface IAuctionActivityRepository {
    logActivity(
        auctionId: string,
        activityType: string,
        description: string,
        userId?: string,
        metadata?: any
    ): Promise<ActivityEntity>;
    getRecentActivities(auctionId: string, limit: number): Promise<ActivityEntity[]>;
}
