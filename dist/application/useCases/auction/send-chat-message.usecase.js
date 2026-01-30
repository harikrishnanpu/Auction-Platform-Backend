"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendChatMessageUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
class SendChatMessageUseCase {
    constructor(chatMessageRepository, participantRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.participantRepository = participantRepository;
    }
    async execute(auctionId, userId, message) {
        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (!participant) {
            throw new auction_errors_1.AuctionError("NOT_ALLOWED", "User not entered in auction");
        }
        if (participant.revokedAt) {
            throw new auction_errors_1.AuctionError("USER_REVOKED", "User revoked from auction");
        }
        return this.chatMessageRepository.createMessage(auctionId, userId, message);
    }
}
exports.SendChatMessageUseCase = SendChatMessageUseCase;
