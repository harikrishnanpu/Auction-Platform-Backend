import { IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { AuctionError, AuctionErrorCode } from "../../../domain/auction/auction.errors";
import { AuctionMessages } from "../../../application/constants/auction.messages";

export class SendChatMessageUseCase {
    constructor(
        private _chatMessageRepository: IChatMessageRepository,
        private _participantRepository: IAuctionParticipantRepository
    ) { }

    async execute(auctionId: string, userId: string, message: string) {
        const participant = await this._participantRepository.findByAuctionAndUser(auctionId, userId);
        if (!participant) {
            throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, AuctionMessages.USER_NOT_ENTERED);
        }
        if (participant.revokedAt) {
            throw new AuctionError(AuctionErrorCode.USER_REVOKED, AuctionMessages.USER_REVOKED);
        }
        return this._chatMessageRepository.createMessage(auctionId, userId, message);
    }
}

