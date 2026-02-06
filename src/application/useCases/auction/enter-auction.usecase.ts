import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { IUserRepository } from "../../../domain/user/user.repository";
import { ensureAuctionActive } from "../../../domain/auction/auction.policy";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class EnterAuctionUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private userRepository: IUserRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, userId: string) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }
        ensureAuctionActive(auction);
        const now = new Date();
        if (now > auction.endAt) {
            throw new AuctionError("AUCTION_ENDED", "Auction has ended");
        }

        const user = await this.userRepository.findById(userId);
        if (!user || user.is_blocked || !user.is_verified) {
            throw new AuctionError("NOT_ALLOWED", "User not eligible to enter");
        }

        if (auction.sellerId === userId) {
            throw new AuctionError("NOT_ALLOWED", "Sellers cannot join their own auction as participants. Please use the seller dashboard.");
        }

        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (participant?.revokedAt) {
            throw new AuctionError("USER_REVOKED", "You have been revoked from this auction and cannot rejoin");
        }

        const result = await this.participantRepository.upsertParticipant(auctionId, userId);
        // Don't log user join - participants panel already shows who joined
        return result;
    }
}
