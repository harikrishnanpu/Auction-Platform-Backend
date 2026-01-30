import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError } from '../../../domain/auction/auction.errors';

export class EndAuctionUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) {}

  async execute(auctionId: string, sellerId: string): Promise<void> {
    const auction = await this.auctionRepository.findById(auctionId);

    if (!auction) {
      throw AuctionError.notFound();
    }

    // Verify seller ownership
    if (auction.sellerId !== sellerId) {
      throw new Error('Unauthorized: Only the seller can end this auction');
    }

    // Can only end active auctions
    if (auction.status !== 'ACTIVE') {
      throw new Error('Can only end active auctions');
    }

    // Update auction status to ENDED
    await this.auctionRepository.update(auctionId, { status: 'ENDED' });
  }
}
