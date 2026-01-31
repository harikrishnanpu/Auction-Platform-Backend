"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdminAuctionsUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class GetAdminAuctionsUseCase {
    constructor(auctionRepository, storageService) {
        this.auctionRepository = auctionRepository;
        this.storageService = storageService;
    }
    async execute(page, limit, filters, sort) {
        const { auctions, total } = await this.auctionRepository.findAllPaginatedAndFiltered(page, limit, filters, sort);
        // Enrich asset URLs with presigned links
        const enrichedAuctions = await Promise.all(auctions.map(async (auction) => {
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
            // Return a plain object or modified entity
            return {
                ...auction, // Spread entity properties (might include methods, be careful if serializing)
                assets: assetsWithSignedUrls,
                // Ensure we expose necessary fields plainly
                id: auction.id,
                title: auction.title,
                status: auction.status,
                seller_id: auction.sellerId,
                start_price: auction.startPrice,
                current_price: auction.currentPrice,
                created_at: auction.createdAt,
                // Add other needed fields
            };
        }));
        return result_1.Result.ok({
            auctions: enrichedAuctions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
exports.GetAdminAuctionsUseCase = GetAdminAuctionsUseCase;
