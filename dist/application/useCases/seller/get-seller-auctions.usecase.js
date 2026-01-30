"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellerAuctionsUseCase = void 0;
class GetSellerAuctionsUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(sellerId) {
        const auctions = await this.auctionRepository.findBySellerId(sellerId);
        // Enrich asset URLs with presigned links
        return await Promise.all(auctions.map(async (auction) => {
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
        }));
    }
}
exports.GetSellerAuctionsUseCase = GetSellerAuctionsUseCase;
