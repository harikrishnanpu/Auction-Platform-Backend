import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Result } from "@result/result";
import { ISellerEndAuctionUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class EndAuctionUseCase implements ISellerEndAuctionUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) { }

  async execute(sellerId: string, auctionId: string): Promise<Result<void>> {
    try {
      const auction = await this.auctionRepository.findById(auctionId);

      if (!auction) {
        return Result.fail("Auction not found");
      }

      if (auction.sellerId !== sellerId) {
        return Result.fail("Unauthorized: Only the seller can end this auction");
      }

      if (auction.status !== 'ACTIVE') {
        return Result.fail("Can only end active auctions");
      }

      await this.auctionRepository.update(auctionId, { status: 'ENDED' });
      return Result.ok<void>(undefined);
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
