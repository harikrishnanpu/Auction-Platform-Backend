"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellerAuctionByIdUseCase = void 0;
class GetSellerAuctionByIdUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(auctionId, sellerId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.sellerId !== sellerId) {
            throw new Error("Auction not found");
        }
        const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
            if (asset.url.startsWith("http"))
                return asset;
            const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
            return { ...asset, url: signedUrl };
        }));
        return {
            ...auction,
            assets: assetsWithSignedUrls
        };
    }
}
exports.GetSellerAuctionByIdUseCase = GetSellerAuctionByIdUseCase;
