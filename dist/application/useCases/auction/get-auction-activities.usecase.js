"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionActivitiesUseCase = void 0;
class GetAuctionActivitiesUseCase {
    constructor(activityRepository) {
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, limit = 50) {
        return await this.activityRepository.getRecentActivities(auctionId, limit);
    }
}
exports.GetAuctionActivitiesUseCase = GetAuctionActivitiesUseCase;
