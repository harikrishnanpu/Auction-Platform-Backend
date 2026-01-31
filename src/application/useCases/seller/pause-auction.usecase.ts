import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError, AuctionErrorCode } from '../../../domain/auction/auction.errors';
import { AuctionMessages } from '../../../application/constants/auction.messages';

export class PauseAuctionUseCase {
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

    // Can only pause active, non-paused auctions
    if (auction.status !== 'ACTIVE') {
      throw new AuctionError(AuctionErrorCode.INVALID_STATUS, 'Can only pause active auctions');
    }

    if (auction.isPaused) {
      throw new AuctionError(AuctionErrorCode.INVALID_STATUS, 'Auction is already paused');
    }

    // Update auction to paused state
    await this._auctionRepository.update(auctionId, { isPaused: true });
  }
}

