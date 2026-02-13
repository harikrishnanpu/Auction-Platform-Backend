import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Auction } from "@domain/entities/auction/auction.entity";
import { Result } from "@result/result";
import { IPublishAuctionUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class PublishAuctionUseCase implements IPublishAuctionUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(sellerId: string, auctionId: string): Promise<Result<void>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return Result.fail("Auction not found");
            }

            if (auction.status === 'ACTIVE') {
                return Result.ok<void>(undefined);
            }

            if (auction.status !== 'DRAFT') {
                return Result.fail("Only draft auctions can be published");
            }

            if (!auction.assets?.length) {
                return Result.fail("Add at least one image or video before publishing");
            }

            const now = new Date();
            if (auction.endAt <= now) {
                return Result.fail("End time must be in the future");
            }
            if (auction.endAt <= auction.startAt) {
                return Result.fail("End time must be after start time");
            }

            await this.auctionRepository.updateStatus(auctionId, 'ACTIVE');
            return Result.ok<void>(undefined);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
