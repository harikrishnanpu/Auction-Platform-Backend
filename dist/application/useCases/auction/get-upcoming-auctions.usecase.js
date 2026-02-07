"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUpcomingAuctionsUseCase = void 0;
class GetUpcomingAuctionsUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute() {
        const now = new Date();
        // Get all ACTIVE auctions that haven't started yet
        const allAuctions = await this.auctionRepository.findAll();
        const upcoming = allAuctions.filter(auction => auction.status === 'ACTIVE' &&
            auction.startAt > now);
        return await Promise.all(upcoming.map(async (auction) => {
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
exports.GetUpcomingAuctionsUseCase = GetUpcomingAuctionsUseCase;
