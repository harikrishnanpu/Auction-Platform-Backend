import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError } from '../../../domain/auction/auction.errors';

export class ResumeAuctionUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) {}

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

    // Update auction to resume (unpause)
    await this.auctionRepository.update(auctionId, { isPaused: false });
  }
}
