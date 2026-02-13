import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Result } from "@result/result";
import { IPauseAuctionUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class PauseAuctionUseCase implements IPauseAuctionUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) { }

  async execute(sellerId: string, auctionId: string): Promise<Result<void>> {
    try {
      const auction = await this.auctionRepository.findById(auctionId);

      if (!auction) {
        return Result.fail("Auction not found");
      }

      if (auction.sellerId !== sellerId) {
        return Result.fail("Unauthorized: Only the seller can pause this auction");
      }

      if (auction.status !== 'ACTIVE') {
        return Result.fail("Can only pause active auctions");
      }

      if (auction.isPaused) {
        return Result.fail("Auction is already paused");
      }

      await this.auctionRepository.update(auctionId, { isPaused: true });
      return Result.ok<void>(undefined);
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
