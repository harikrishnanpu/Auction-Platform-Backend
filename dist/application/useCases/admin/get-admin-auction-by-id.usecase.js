"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdminAuctionByIdUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class GetAdminAuctionByIdUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(auctionId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            return result_1.Result.fail("Auction not found");
        }
        const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
            if (asset.url.startsWith("http"))
                return asset;
            try {
                const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
                return { ...asset, url: signedUrl };
            }
            catch (e) {
                return asset;
            }
        }));
        const result = {
            ...auction,
            assets: assetsWithSignedUrls
        };
        return result_1.Result.ok(result);
    }
}
exports.GetAdminAuctionByIdUseCase = GetAdminAuctionByIdUseCase;
