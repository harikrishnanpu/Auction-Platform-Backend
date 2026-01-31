"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionRoomStateUseCase = void 0;
class GetAuctionRoomStateUseCase {
    constructor(_auctionRepository, _bidRepository, _chatMessageRepository, _activityRepository) {
        this._auctionRepository = _auctionRepository;
        this._bidRepository = _bidRepository;
        this._chatMessageRepository = _chatMessageRepository;
        this._activityRepository = _activityRepository;
    }
    async execute(auctionId, limit = 20, userId) {
        const [auction, latestBids, latestMessages, recentActivities] = await Promise.all([
            this._auctionRepository.findById(auctionId),
            this._bidRepository.findLatestValidByAuction(auctionId, limit),
            this._chatMessageRepository.findLatestByAuction(auctionId, limit),
            this._activityRepository.getRecentActivities(auctionId, 50)
        ]);
        // Get user's last bid time for rate limit persistence
        let lastBidTime = null;
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
exports.GetAuctionRoomStateUseCase = GetAuctionRoomStateUseCase;
