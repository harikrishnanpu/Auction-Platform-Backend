"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendChatMessageUseCase = void 0;
const auction_policy_1 = require("@domain/entities/auction/auction.policy");
const result_1 = require("@result/result");
class SendChatMessageUseCase {
    constructor(chatMessageRepository, participantRepository, auctionRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.participantRepository = participantRepository;
        this.auctionRepository = auctionRepository;
    }
    async execute(auctionId, userId, message) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return result_1.Result.fail("Auction not found");
            }
            try {
                (0, auction_policy_1.ensureAuctionActive)(auction);
                (0, auction_policy_1.ensureAuctionWindow)(auction, new Date());
            }
            catch (e) {
                return result_1.Result.fail(e.message);
            }
            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (participant?.revokedAt) {
                return result_1.Result.fail("User revoked from auction");
            }
            if (!message.trim()) {
                return result_1.Result.fail("Message cannot be empty");
            }
            const chatMessage = await this.chatMessageRepository.createMessage(auctionId, userId, message);
            return result_1.Result.ok(chatMessage);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.SendChatMessageUseCase = SendChatMessageUseCase;
