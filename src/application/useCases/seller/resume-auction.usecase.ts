import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError } from '../../../domain/auction/auction.errors';
import { EndAuctionUseCase } from '../auction/end-auction.usecase';

export class ResumeAuctionUseCase {
  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly endAuctionUseCase: EndAuctionUseCase
  ) { }

  async execute(auctionId: string, sellerId: string): Promise<void> {
    const auction = await this.auctionRepository.findById(auctionId);

    if (!auction) {
      throw AuctionError.notFound();
    }

    // Verify seller ownership
    if (auction.sellerId !== sellerId) {
      throw new Error('Unauthorized: Only the seller can resume this auction');
    }

    // Can only resume paused auctions
    if (auction.status !== 'ACTIVE') {
      throw new Error('Can only resume active auctions');
    }

    if (!auction.isPaused) {
      throw new Error('Auction is not paused');
    }

    const now = new Date();
    if (auction.endAt <= now) {
      await this.endAuctionUseCase.execute(auctionId, 'SYSTEM');
      return;
    }

    await this.auctionRepository.update(auctionId, { isPaused: false });
  }
}
