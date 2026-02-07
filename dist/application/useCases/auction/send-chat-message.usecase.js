"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendChatMessageUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const auction_policy_1 = require("../../../domain/auction/auction.policy");
class SendChatMessageUseCase {
    constructor(chatMessageRepository, participantRepository, auctionRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.participantRepository = participantRepository;
        this.auctionRepository = auctionRepository;
    }
    async execute(auctionId, userId, message) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new auction_errors_1.AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }
        (0, auction_policy_1.ensureAuctionActive)(auction);
        (0, auction_policy_1.ensureAuctionWindow)(auction, new Date());
        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (participant?.revokedAt) {
            throw new auction_errors_1.AuctionError("USER_REVOKED", "User revoked from auction");
        }
        if (!message.trim()) {
            throw new auction_errors_1.AuctionError("NOT_ALLOWED", "Message cannot be empty");
        }
        return this.chatMessageRepository.createMessage(auctionId, userId, message);
    }
}
exports.SendChatMessageUseCase = SendChatMessageUseCase;
