"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellerAuctionsUseCase = void 0;
const result_1 = require("@result/result");
class GetSellerAuctionsUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(sellerId, params) {
        try {
            const auctions = await this.auctionRepository.findBySellerId(sellerId);
            const enrichedAuctions = await Promise.all(auctions.map(async (auction) => {
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
            return result_1.Result.ok(enrichedAuctions);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetSellerAuctionsUseCase = GetSellerAuctionsUseCase;
