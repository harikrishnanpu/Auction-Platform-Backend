import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";
import { IStorageService } from "../../services/storage/storage.service";

export class GetSellerAuctionsUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(sellerId: string): Promise<Auction[]> {
        const auctions = await this.auctionRepository.findBySellerId(sellerId);

        // Enrich asset URLs with presigned links
        return await Promise.all(auctions.map(async (auction) => {
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
