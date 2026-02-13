import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Auction } from "@domain/entities/auction/auction.entity";
import { IStorageService } from "@application/services/storage/storage.service";
import { Result } from "@result/result";
import { IGetUpcomingAuctionsUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class GetUpcomingAuctionsUseCase implements IGetUpcomingAuctionsUseCase {
  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly storageService: IStorageService
  ) { }

  async execute(params: any): Promise<Result<Auction[]>> {
    try {
      const now = new Date();
      const allAuctions = await this.auctionRepository.findAll();

      const upcoming = allAuctions.filter(auction =>
        auction.status === 'ACTIVE' &&
        auction.startAt > now
      );

      const enrichedAuctions = await Promise.all(upcoming.map(async (auction) => {
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

      return Result.ok(enrichedAuctions);
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
