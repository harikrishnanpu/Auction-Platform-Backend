import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Auction } from "@domain/entities/auction/auction.entity";
import { IStorageService } from "@application/services/storage/storage.service";
import { Result } from "@result/result";
import { IGetActiveAuctionsUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class GetActiveAuctionsUseCase implements IGetActiveAuctionsUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(params: any): Promise<Result<Auction[]>> {
        try {
            const auctions = await this.auctionRepository.findActive();

            const enrichedAuctions = await Promise.all(auctions.map(async (auction) => {
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
