import { IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { AuctionError } from "../../../domain/auction/auction.errors";
import { ensureAuctionActive, ensureAuctionWindow } from "../../../domain/auction/auction.policy";

export class SendChatMessageUseCase {
    constructor(
        private chatMessageRepository: IChatMessageRepository,
        private participantRepository: IAuctionParticipantRepository,
        private auctionRepository: IAuctionRepository
    ) { }

    async execute(auctionId: string, userId: string, message: string) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }

        ensureAuctionActive(auction);
        ensureAuctionWindow(auction, new Date());

        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (participant?.revokedAt) {
            throw new AuctionError("USER_REVOKED", "User revoked from auction");
        }

        if (!message.trim()) {
            throw new AuctionError("NOT_ALLOWED", "Message cannot be empty");
        }
        return this.chatMessageRepository.createMessage(auctionId, userId, message);
    }
}
