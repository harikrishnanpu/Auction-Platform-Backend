import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { ChatMessageEntity, IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";

export class CreateChatMessageUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private chatMessageRepository: IChatMessageRepository
    ) { }

    async execute(auctionId: string, userId: string, message: string): Promise<ChatMessageEntity> {
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
