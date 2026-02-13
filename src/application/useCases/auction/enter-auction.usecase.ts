import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "@domain/entities/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { IUserRepository } from "@domain/repositories/user.repository";
import { ensureAuctionActive } from "@domain/entities/auction/auction.policy";
import { Result } from "@result/result";
import { IEnterAuctionUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class EnterAuctionUseCase implements IEnterAuctionUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private userRepository: IUserRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, userId: string): Promise<Result<any>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return Result.fail("Auction not found");
            }

            try {
                ensureAuctionActive(auction);
            } catch (e) {
                return Result.fail((e as Error).message);
            }

            const now = new Date();
            if (now > auction.endAt) {
                return Result.fail("Auction has ended");
            }

            const user = await this.userRepository.findById(userId);
            if (!user || user.is_blocked || !user.is_verified) {
                return Result.fail("User not eligible to enter");
            }

            if (auction.sellerId === userId) {
                return Result.fail("Sellers cannot join their own auction as participants. Please use the seller dashboard.");
            }

            const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
            if (participant?.revokedAt) {
                return Result.fail("You have been revoked from this auction and cannot rejoin");
            }

            const result = await this.participantRepository.upsertParticipant(auctionId, userId);
            return Result.ok(result);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
