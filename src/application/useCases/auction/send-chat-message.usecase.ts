import { IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class SendChatMessageUseCase {
    constructor(
        private chatMessageRepository: IChatMessageRepository,
        private participantRepository: IAuctionParticipantRepository
    ) { }

    async execute(auctionId: string, userId: string, message: string) {
        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (!participant) {
            throw new AuctionError("NOT_ALLOWED", "User not entered in auction");
        }
        if (participant.revokedAt) {
            throw new AuctionError("USER_REVOKED", "User revoked from auction");
        }
        return this.chatMessageRepository.createMessage(auctionId, userId, message);
    }
}
