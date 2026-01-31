import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";

export class GetAuctionRoomStateUseCase {
    constructor(
        private _auctionRepository: IAuctionRepository,
        private _bidRepository: IBidRepository,
        private _chatMessageRepository: IChatMessageRepository,
        private _activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, limit: number = 20, userId?: string) {
        const [auction, latestBids, latestMessages, recentActivities] = await Promise.all([
            this._auctionRepository.findById(auctionId),
            this._bidRepository.findLatestValidByAuction(auctionId, limit),
            this._chatMessageRepository.findLatestByAuction(auctionId, limit),
            this._activityRepository.getRecentActivities(auctionId, 50)
        ]);

        // Get user's last bid time for rate limit persistence
        let lastBidTime: Date | null = null;
        if (userId) {
            const userBids = await this._bidRepository.findByUserInAuction(auctionId, userId, 1);
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

