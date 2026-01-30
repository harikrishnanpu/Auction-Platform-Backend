import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";
import { IStorageService } from "../../services/storage/storage.service";

export class GetSellerAuctionByIdUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(auctionId: string, sellerId: string): Promise<Auction> {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.sellerId !== sellerId) {
            throw new Error("Auction not found");
        }

        const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
            if (asset.url.startsWith("http")) return asset;
            const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
            return { ...asset, url: signedUrl };
        }));

        return {
            ...auction,
            assets: assetsWithSignedUrls
        } as any as Auction;
    }
}
