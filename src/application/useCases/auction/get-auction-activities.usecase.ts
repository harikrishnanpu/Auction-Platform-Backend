import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { Result } from "@result/result";
import { IGetAuctionActivitiesUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class GetAuctionActivitiesUseCase implements IGetAuctionActivitiesUseCase {
    constructor(private activityRepository: IAuctionActivityRepository) { }

    async execute(auctionId: string, limit: number = 50): Promise<Result<any[]>> {
        try {
            const activities = await this.activityRepository.getRecentActivities(auctionId, limit);
            return Result.ok(activities);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
