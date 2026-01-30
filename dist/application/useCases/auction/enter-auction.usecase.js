"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterAuctionUseCase = void 0;
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
const auction_policy_1 = require("../../../domain/auction/auction.policy");
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class EnterAuctionUseCase {
    constructor(auctionRepository, participantRepository, userRepository, activityRepository) {
        this.auctionRepository = auctionRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }
    async execute(auctionId, userId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new auction_errors_1.AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }
        (0, auction_policy_1.ensureAuctionActive)(auction);
        (0, auction_policy_1.ensureAuctionWindow)(auction, new Date());
        const userIdVo = user_id_vo_1.UserId.create(userId);
        if (userIdVo.isFailure) {
            throw new auction_errors_1.AuctionError("NOT_ALLOWED", "Invalid user");
        }
        const user = await this.userRepository.findById(userIdVo.getValue());
        // Removed phone requirement - users can enter without phone
        if (!user || user.is_blocked || !user.is_active || !user.is_verified) {
            throw new auction_errors_1.AuctionError("NOT_ALLOWED", "User not eligible to enter");
        }
        // Prevent seller from joining their own auction as a user
        if (auction.sellerId === userId) {
            throw new auction_errors_1.AuctionError("NOT_ALLOWED", "Sellers cannot join their own auction as participants. Please use the seller dashboard.");
        }
        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (participant?.revokedAt) {
            throw new auction_errors_1.AuctionError("USER_REVOKED", "You have been revoked from this auction and cannot rejoin");
        }
        const result = await this.participantRepository.upsertParticipant(auctionId, userId);
        // Don't log user join - participants panel already shows who joined
        return result;
    }
}
exports.EnterAuctionUseCase = EnterAuctionUseCase;
