"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionRoomStateUseCase = void 0;
const result_1 = require("@result/result");
class GetAuctionRoomStateUseCase {
    constructor(auctionRepository, bidRepository, chatMessageRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, limit = 20, userId) {
        try {
            const [auction, latestBids, latestMessages, recentActivities] = await Promise.all([
                this.auctionRepository.findById(auctionId),
                this.bidRepository.findLatestValidByAuction(auctionId, limit),
                this.chatMessageRepository.findLatestByAuction(auctionId, limit),
                this.activityRepository.getRecentActivities(auctionId, 50)
            ]);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            // Get user's last bid time for rate limit persistence
            let lastBidTime = null;
            if (userId) {
                const userBids = await this.bidRepository.findByUserInAuction(auctionId, userId, 1);
                if (userBids.length > 0) {
                    lastBidTime = userBids[0].createdAt;
                }
            }
            return result_1.Result.ok({
                auctionId,
                auction,
                latestBids,
                latestMessages,
                recentActivities,
                lastBidTime
            });
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetAuctionRoomStateUseCase = GetAuctionRoomStateUseCase;
