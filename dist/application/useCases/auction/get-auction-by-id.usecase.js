"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionByIdUseCase = void 0;
class GetAuctionByIdUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(auctionId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.status !== "ACTIVE") {
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
exports.GetAuctionByIdUseCase = GetAuctionByIdUseCase;
