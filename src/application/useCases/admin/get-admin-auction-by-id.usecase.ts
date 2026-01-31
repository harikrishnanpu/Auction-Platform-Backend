import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";
import { IStorageService } from "../../services/storage/storage.service";
import { Result } from "../../../domain/shared/result";

export class GetAdminAuctionByIdUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(auctionId: string): Promise<Result<Auction>> {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            return Result.fail("Auction not found");
        }

        const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
            if (asset.url.startsWith("http")) return asset;
            try {
                const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
                return { ...asset, url: signedUrl };
            } catch (e) { return asset; }
        }));

        const result = {
            ...auction,
            assets: assetsWithSignedUrls
        } as any as Auction;

        return Result.ok<Auction>(result);
    }
}
