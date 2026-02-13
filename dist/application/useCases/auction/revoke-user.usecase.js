"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeUserUseCase = void 0;
const result_1 = require("@result/result");
class RevokeUserUseCase {
    constructor(auctionRepository, participantRepository, bidRepository, activityRepository, transactionManager) {
        this.auctionRepository = auctionRepository;
        this.participantRepository = participantRepository;
        this.bidRepository = bidRepository;
        this.activityRepository = activityRepository;
        this.transactionManager = transactionManager;
    }
    async execute(auctionId, actorId, userId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.sellerId !== actorId) {
                // In some cases, admins might also revoke users. 
                // For now, following the original logic of checking sellerId.
                return result_1.Result.fail("Only owner can revoke users");
            }
            const bidCount = await this.bidRepository.countUserBids(auctionId, userId);
            const result = await this.transactionManager.runInTransaction(async (tx) => {
                const participant = await this.participantRepository.revokeParticipant(auctionId, userId);
                let invalidatedCount = 0;
                let priceChanged = false;
                let newPrice = auction.currentPrice;
                if (bidCount > 0) {
                    invalidatedCount = await this.bidRepository.invalidateUserBids(auctionId, userId, tx);
                    const highestValidBid = await this.bidRepository.findHighestValidBid(auctionId, tx);
                    if (highestValidBid) {
                        newPrice = highestValidBid.amount;
                    }
                    else {
                        newPrice = auction.startPrice;
                    }
                    if (newPrice !== auction.currentPrice) {
                        await this.auctionRepository.updateCurrentPrice(auctionId, newPrice, tx);
                        priceChanged = true;
                    }
                }
                await this.activityRepository.logActivity(auctionId, "USER_REVOKED", `User revoked from auction. ${invalidatedCount} bid(s) invalidated.`, userId, {
                    actorId,
                    invalidatedBids: invalidatedCount,
                    priceChanged,
                    oldPrice: auction.currentPrice,
                    newPrice
                });
                return {
                    participant,
                    invalidatedBids: invalidatedCount,
                    priceChanged,
                    oldPrice: auction.currentPrice,
                    newPrice
                };
            });
            return result_1.Result.ok(result);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.RevokeUserUseCase = RevokeUserUseCase;
