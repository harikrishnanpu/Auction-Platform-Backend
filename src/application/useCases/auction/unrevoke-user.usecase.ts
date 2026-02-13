import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { IAuctionParticipantRepository } from "@domain/entities/auction/repositories/participant.repository";
import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { Result } from "@result/result";
import { IUnrevokeUserUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class UnrevokeUserUseCase implements IUnrevokeUserUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private participantRepository: IAuctionParticipantRepository,
        private activityRepository: IAuctionActivityRepository
    ) { }

    async execute(auctionId: string, actorId: string, userId: string): Promise<Result<any>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return Result.fail("Auction not found");
            }
            if (auction.sellerId !== actorId) {
                return Result.fail("Only owner can manage participants");
            }

            const participant = await this.participantRepository.unrevokeParticipant(auctionId, userId);

            await this.activityRepository.logActivity(
                auctionId,
                "USER_UNREVOKED" as any,
                `User access restored by seller.`,
                userId,
                {
                    actorId
                }
            );

            return Result.ok({
                participant
            });
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
