import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { Auction } from '../../../domain/auction/auction.entity';

export class GetUpcomingAuctionsUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) {}

  async execute(): Promise<Auction[]> {
    const now = new Date();
    
    // Get all ACTIVE auctions that haven't started yet
    const allAuctions = await this.auctionRepository.findAll();
    
    return allAuctions.filter(auction => 
      auction.status === 'ACTIVE' && 
      auction.startAt > now
    );
  }
}
