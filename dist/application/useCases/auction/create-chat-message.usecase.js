"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChatMessageUseCase = void 0;
class CreateChatMessageUseCase {
    constructor(auctionRepository, chatMessageRepository) {
        this.auctionRepository = auctionRepository;
        this.chatMessageRepository = chatMessageRepository;
    }
    async execute(auctionId, userId, message) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.status !== 'ACTIVE') {
            throw new Error("Auction not available");
        }
        if (!message.trim()) {
            throw new Error("Message cannot be empty");
        }
        return await this.chatMessageRepository.createMessage(auctionId, userId, message.trim());
    }
}
exports.CreateChatMessageUseCase = CreateChatMessageUseCase;
