import { IAuctionRepository } from '../../../domain/auction/repositories/auction.repository';
import { Auction } from '../../../domain/auction/auction.entity';
import { IStorageService } from '../../services/storage/storage.service';

export class GetUpcomingAuctionsUseCase {
  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly storageService: IStorageService
  ) { }

  async execute(): Promise<Auction[]> {
    const now = new Date();
    
    // Get all ACTIVE auctions that haven't started yet
    const allAuctions = await this.auctionRepository.findAll();
    
    const upcoming = allAuctions.filter(auction =>
      auction.status === 'ACTIVE' &&
      auction.startAt > now
    );

    return await Promise.all(upcoming.map(async (auction) => {
      const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
        if (asset.url.startsWith("http")) return asset;
        const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
        return { ...asset, url: signedUrl };
      }));

      return {
        ...auction,
        assets: assetsWithSignedUrls
      } as any as Auction;
    }));
  }
}
