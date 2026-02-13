"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionActivitiesUseCase = void 0;
const result_1 = require("@result/result");
class GetAuctionActivitiesUseCase {
    constructor(activityRepository) {
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, limit = 50) {
        try {
            const activities = await this.activityRepository.getRecentActivities(auctionId, limit);
            return result_1.Result.ok(activities);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetAuctionActivitiesUseCase = GetAuctionActivitiesUseCase;
