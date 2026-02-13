import { IChatMessageRepository } from "@domain/entities/auction/repositories/chat-message.repository";
import { IAuctionParticipantRepository } from "@domain/entities/auction/repositories/participant.repository";
import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { ensureAuctionActive, ensureAuctionWindow } from "@domain/entities/auction/auction.policy";
import { Result } from "@result/result";
import { ISendChatMessageUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class SendChatMessageUseCase implements ISendChatMessageUseCase {
    constructor(
        private chatMessageRepository: IChatMessageRepository,
        private participantRepository: IAuctionParticipantRepository,
        private auctionRepository: IAuctionRepository
    ) { }

    async execute(auctionId: string, userId: string, message: string): Promise<Result<any>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return Result.fail("Auction not found");
            }

            try {
                ensureAuctionActive(auction);
                ensureAuctionWindow(auction, new Date());
            } catch (e) {
                return Result.fail((e as Error).message);
            }

            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (participant?.revokedAt) {
                return Result.fail("User revoked from auction");
            }

            if (!message.trim()) {
                return Result.fail("Message cannot be empty");
            }

            const chatMessage = await this.chatMessageRepository.createMessage(auctionId, userId, message);
            return Result.ok(chatMessage);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
