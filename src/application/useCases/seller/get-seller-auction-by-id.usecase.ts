import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Auction } from "@domain/entities/auction/auction.entity";
import { IStorageService } from "@application/services/storage/storage.service";
import { Result } from "@result/result";
import { IGetSellerAuctionByIdUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class GetSellerAuctionByIdUseCase implements IGetSellerAuctionByIdUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(sellerId: string, auctionId: string): Promise<Result<Auction>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return Result.fail("Auction not found");
            }

            const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
                if (asset.url.startsWith("http")) return asset;
                const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
                return { ...asset, url: signedUrl };
            }));

            return Result.ok({
                ...auction,
                assets: assetsWithSignedUrls
            } as any as Auction);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
