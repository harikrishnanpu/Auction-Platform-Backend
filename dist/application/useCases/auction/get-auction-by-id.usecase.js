"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionByIdUseCase = void 0;
const result_1 = require("@result/result");
class GetAuctionByIdUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(auctionId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.status !== "ACTIVE") {
                return result_1.Result.fail("Auction not found");
            }
            const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
                if (asset.url.startsWith("http"))
                    return asset;
                const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
                return { ...asset, url: signedUrl };
            }));
            return result_1.Result.ok({
                ...auction,
                assets: assetsWithSignedUrls
            });
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetAuctionByIdUseCase = GetAuctionByIdUseCase;
