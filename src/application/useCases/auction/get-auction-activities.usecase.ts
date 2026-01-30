import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";

export class GetAuctionActivitiesUseCase {
    constructor(private activityRepository: IAuctionActivityRepository) {}

    async execute(auctionId: string, limit: number = 50) {
        return await this.activityRepository.getRecentActivities(auctionId, limit);
    }
}
