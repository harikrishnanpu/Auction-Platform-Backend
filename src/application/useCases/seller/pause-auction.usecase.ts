import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError } from '../../../domain/auction/auction.errors';

export class PauseAuctionUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) {}

  async execute(auctionId: string, sellerId: string): Promise<void> {
    const auction = await this.auctionRepository.findById(auctionId);

    if (!auction) {
      throw AuctionError.notFound();
    }

    // Verify seller ownership
    if (auction.sellerId !== sellerId) {
      throw new Error('Unauthorized: Only the seller can pause this auction');
    }

    // Can only pause active, non-paused auctions
    if (auction.status !== 'ACTIVE') {
      throw new Error('Can only pause active auctions');
    }

    if (auction.isPaused) {
      throw new Error('Auction is already paused');
    }

    // Update auction to paused state
    await this.auctionRepository.update(auctionId, { isPaused: true });
  }
}
