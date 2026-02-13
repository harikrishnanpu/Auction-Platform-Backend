import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Result } from "@result/result";
import { IResumeAuctionUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";
import { IEndAuctionUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class ResumeAuctionUseCase implements IResumeAuctionUseCase {
  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly endAuctionUseCase: IEndAuctionUseCase
  ) { }

  async execute(sellerId: string, auctionId: string): Promise<Result<void>> {
    try {
      const auction = await this.auctionRepository.findById(auctionId);

      if (!auction) {
        return Result.fail("Auction not found");
      }

      if (auction.sellerId !== sellerId) {
        return Result.fail("Unauthorized: Only the seller can resume this auction");
      }

      if (auction.status !== 'ACTIVE') {
        return Result.fail("Can only resume active auctions");
      }

      if (!auction.isPaused) {
        return Result.fail("Auction is not paused");
      }

      const now = new Date();
      if (auction.endAt <= now) {
        await this.endAuctionUseCase.execute(auctionId, 'SYSTEM');
        return Result.ok<void>(undefined);
      }

      await this.auctionRepository.update(auctionId, { isPaused: false });
      return Result.ok<void>(undefined);
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
