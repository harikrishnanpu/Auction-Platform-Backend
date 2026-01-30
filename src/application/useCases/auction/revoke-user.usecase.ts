import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class RevokeUserUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository
    ) { }

    async execute(auctionId: string, sellerId: string, userId: string) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }
        if (auction.sellerId !== sellerId) {
            throw new AuctionError("NOT_ALLOWED", "Only owner can revoke users");
        }
        return this.participantRepository.revokeParticipant(auctionId, userId);
    }
}
