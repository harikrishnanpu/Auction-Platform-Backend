import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "../../../domain/auction/repositories/activity.repository";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class UnrevokeUserUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, sellerId: string, userId: string) {
        // Verify auction and seller
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
        }
        if (auction.sellerId !== sellerId) {
            throw new AuctionError("NOT_ALLOWED", "Only owner can manage participants");
        }

        // Unrevoke participant
        const participant = await this.participantRepository.unrevokeParticipant(auctionId, userId);

        // Log activity
        await this.activityRepository.logActivity(
            auctionId,
            "USER_UNREVOKED" as any, // Adding a new activity type
            `User access restored by seller.`,
            userId,
            {
                sellerId
            }
        );

        return {
            participant
        };
    }
}
