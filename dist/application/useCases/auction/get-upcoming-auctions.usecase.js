"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUpcomingAuctionsUseCase = void 0;
const result_1 = require("@result/result");
class GetUpcomingAuctionsUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(params) {
        try {
            const now = new Date();
            const allAuctions = await this.auctionRepository.findAll();
            const upcoming = allAuctions.filter(auction => auction.status === 'ACTIVE' &&
                auction.startAt > now);
            const enrichedAuctions = await Promise.all(upcoming.map(async (auction) => {
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
exports.GetUpcomingAuctionsUseCase = GetUpcomingAuctionsUseCase;
