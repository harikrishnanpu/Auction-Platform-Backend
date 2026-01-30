"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionRoomStateUseCase = void 0;
class GetAuctionRoomStateUseCase {
    constructor(auctionRepository, bidRepository, chatMessageRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, limit = 20, userId) {
        const [auction, latestBids, latestMessages, recentActivities] = await Promise.all([
            this.auctionRepository.findById(auctionId),
            this.bidRepository.findLatestValidByAuction(auctionId, limit),
            this.chatMessageRepository.findLatestByAuction(auctionId, limit),
            this.activityRepository.getRecentActivities(auctionId, 50)
        ]);
        // Get user's last bid time for rate limit persistence
        let lastBidTime = null;
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
exports.GetAuctionRoomStateUseCase = GetAuctionRoomStateUseCase;
