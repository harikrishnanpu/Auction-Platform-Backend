import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";

export class GetAuctionRoomStateUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private chatMessageRepository: IChatMessageRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, limit: number = 20, userId?: string) {
        const [auction, latestBids, latestMessages, recentActivities] = await Promise.all([
            this.auctionRepository.findById(auctionId),
            this.bidRepository.findLatestValidByAuction(auctionId, limit),
            this.chatMessageRepository.findLatestByAuction(auctionId, limit),
            this.activityRepository.getRecentActivities(auctionId, 50)
        ]);

        // Get user's last bid time for rate limit persistence
        let lastBidTime: Date | null = null;
        if (userId) {
            const userBids = await this.bidRepository.findByUserInAuction(auctionId, userId, 1);
            if (userBids.length > 0) {
                lastBidTime = userBids[0].createdAt;
            }
        }

        return {
            auctionId,
            auction,
            latestBids,
            latestMessages,
            recentActivities,
            lastBidTime
        };
    }
}
