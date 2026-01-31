"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendChatMessageUseCase = void 0;
const auction_errors_1 = require("../../../domain/auction/auction.errors");
const auction_messages_1 = require("../../../application/constants/auction.messages");
class SendChatMessageUseCase {
    constructor(_chatMessageRepository, _participantRepository) {
        this._chatMessageRepository = _chatMessageRepository;
        this._participantRepository = _participantRepository;
    }
    async execute(auctionId, userId, message) {
        const participant = await this._participantRepository.findByAuctionAndUser(auctionId, userId);
        if (!participant) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, auction_messages_1.AuctionMessages.USER_NOT_ENTERED);
        }
        if (participant.revokedAt) {
            throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.USER_REVOKED, auction_messages_1.AuctionMessages.USER_REVOKED);
        }
        return this._chatMessageRepository.createMessage(auctionId, userId, message);
    }
}
exports.SendChatMessageUseCase = SendChatMessageUseCase;
