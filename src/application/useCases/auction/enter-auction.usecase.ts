import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IUserRepository } from "../../../domain/user/user.repository";
import { UserId } from "../../../domain/user/user-id.vo";
import { ensureAuctionActive, ensureAuctionWindow } from "../../../domain/auction/auction.policy";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class EnterAuctionUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(auctionId: string, userId: string) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }

        ensureAuctionActive(auction);
        ensureAuctionWindow(auction, new Date());

        const userIdVo = UserId.create(userId);
        if (userIdVo.isFailure) {
            throw new AuctionError("NOT_ALLOWED", "Invalid user");
        }
        const user = await this.userRepository.findById(userIdVo.getValue());
        // Removed phone requirement - users can enter without phone
        if (!user || user.is_blocked || !user.is_active || !user.is_verified) {
            throw new AuctionError("NOT_ALLOWED", "User not eligible to enter");
        }

        // Allow seller to enter their own auction room (as host, not bidder)
        if (auction.sellerId === userId) {
            return this.participantRepository.upsertParticipant(auctionId, userId);
        }

        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (participant?.revokedAt) {
            throw new AuctionError("USER_REVOKED", "User revoked from auction");
        }

        return this.participantRepository.upsertParticipant(auctionId, userId);
    }
}
