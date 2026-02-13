"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterAuctionUseCase = void 0;
const auction_policy_1 = require("@domain/entities/auction/auction.policy");
const result_1 = require("@result/result");
class EnterAuctionUseCase {
    constructor(auctionRepository, participantRepository, userRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, userId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            try {
                (0, auction_policy_1.ensureAuctionActive)(auction);
            }
            catch (e) {
                return result_1.Result.fail(e.message);
            }
            const now = new Date();
            if (now > auction.endAt) {
                return result_1.Result.fail("Auction has ended");
            }
            const user = await this.userRepository.findById(userId);
            if (!user || user.is_blocked || !user.is_verified) {
                return result_1.Result.fail("User not eligible to enter");
            }
            if (auction.sellerId === userId) {
                return result_1.Result.fail("Sellers cannot join their own auction as participants. Please use the seller dashboard.");
            }
            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (participant?.revokedAt) {
                return result_1.Result.fail("You have been revoked from this auction and cannot rejoin");
            }
            const result = await this.participantRepository.upsertParticipant(auctionId, userId);
            return result_1.Result.ok(result);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.EnterAuctionUseCase = EnterAuctionUseCase;
