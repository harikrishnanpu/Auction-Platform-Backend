import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { IBidRepository } from "@domain/entities/auction/repositories/bid.repository";
import { IChatMessageRepository } from "@domain/entities/auction/repositories/chat-message.repository";
import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { Result } from "@result/result";
import { IGetAuctionRoomStateUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class GetAuctionRoomStateUseCase implements IGetAuctionRoomStateUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private chatMessageRepository: IChatMessageRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, limit: number = 20, userId?: string): Promise<Result<any>> {
        try {
            const [auction, latestBids, latestMessages, recentActivities] = await Promise.all([
                this.auctionRepository.findById(auctionId),
                this.bidRepository.findLatestValidByAuction(auctionId, limit),
                this.chatMessageRepository.findLatestByAuction(auctionId, limit),
                this.activityRepository.getRecentActivities(auctionId, 50)
            ]);

            if (!auction) {
                return Result.fail("Auction not found");
            }

            // Get user's last bid time for rate limit persistence
            let lastBidTime: Date | null = null;
            if (userId) {
                const userBids = await this.bidRepository.findByUserInAuction(auctionId, userId, 1);
                if (userBids.length > 0) {
                    lastBidTime = userBids[0].createdAt;
                }
            }

            return Result.ok({
                auctionId,
                auction,
                latestBids,
                latestMessages,
                recentActivities,
                lastBidTime
            });
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
