import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError, AuctionErrorCode } from '../../../domain/auction/auction.errors';
import { AuctionMessages } from '../../../application/constants/auction.messages';

export class ResumeAuctionUseCase {
  constructor(private readonly _auctionRepository: IAuctionRepository) { }

  async execute(auctionId: string, sellerId: string): Promise<void> {
    const auction = await this._auctionRepository.findById(auctionId);

    if (!auction) {
      throw AuctionError.notFound();
    }

    // Verify seller ownership
    if (auction.sellerId !== sellerId) {
      throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, AuctionMessages.NOT_ALLOWED);
    }

    // Can only resume paused auctions
    if (auction.status !== 'ACTIVE') {
      throw new AuctionError(AuctionErrorCode.INVALID_STATUS, 'Can only resume active auctions');
    }

    if (!auction.isPaused) {
      throw new AuctionError(AuctionErrorCode.INVALID_STATUS, 'Auction is not paused');
    }

    // Update auction to resume (unpause)
    await this._auctionRepository.update(auctionId, { isPaused: false });
  }
}

