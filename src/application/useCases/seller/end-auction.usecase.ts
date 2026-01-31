import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { AuctionError, AuctionErrorCode } from '../../../domain/auction/auction.errors';
import { AuctionMessages } from '../../../application/constants/auction.messages';

export class EndAuctionUseCase {
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

    // Can only end active auctions
    if (auction.status !== 'ACTIVE') {
      throw new AuctionError(AuctionErrorCode.INVALID_STATUS, 'Can only end active auctions');
    }

    // Update auction status to ENDED
    await this._auctionRepository.update(auctionId, { status: 'ENDED' });
  }
}

