import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { IUserRepository } from "../../../domain/user/user.repository";
import { UserId } from "../../../domain/user/user-id.vo";
import { ensureAuctionActive, ensureAuctionWindow } from "../../../domain/auction/auction.policy";
import { AuctionError, AuctionErrorCode } from "../../../domain/auction/auction.errors";
import { AuctionMessages } from "../../../application/constants/auction.messages";

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
            throw new AuctionError(AuctionErrorCode.AUCTION_NOT_FOUND, AuctionMessages.AUCTION_NOT_FOUND);
        }
        ensureAuctionActive(auction);
        ensureAuctionWindow(auction, new Date());

        const userIdVo = UserId.create(userId);
        if (userIdVo.isFailure) {
            throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, "Invalid user");
        }
        const user = await this.userRepository.findById(userIdVo.getValue());
        // Removed phone requirement - users can enter without phone
        if (!user || user.is_blocked || !user.is_active || !user.is_verified) {
            throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, "User not eligible to enter");
        }

        // Prevent seller from joining their own auction as a user
        if (auction.sellerId === userId) {
            throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, AuctionMessages.SELLER_NOT_ALLOWED);
        }

        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (participant?.revokedAt) {
            throw new AuctionError(AuctionErrorCode.USER_REVOKED, AuctionMessages.REVOKED_FROM_AUCTION);
        }


        const result = await this.participantRepository.upsertParticipant(auctionId, userId);
        // Don't log user join - participants panel already shows who joined
        return result;
    }
}
