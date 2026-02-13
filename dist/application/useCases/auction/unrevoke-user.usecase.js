"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnrevokeUserUseCase = void 0;
const result_1 = require("@result/result");
class UnrevokeUserUseCase {
    constructor(auctionRepository, participantRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.participantRepository = participantRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, actorId, userId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            if (auction.sellerId !== actorId) {
                return result_1.Result.fail("Only owner can manage participants");
            }
            const participant = await this.participantRepository.unrevokeParticipant(auctionId, userId);
            await this.activityRepository.logActivity(auctionId, "USER_UNREVOKED", `User access restored by seller.`, userId, {
                actorId
            });
            return result_1.Result.ok({
                participant
            });
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.UnrevokeUserUseCase = UnrevokeUserUseCase;
