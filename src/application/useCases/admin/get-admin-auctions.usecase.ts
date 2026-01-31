import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { AdminAuctionListResponseDto } from "../../dtos/admin/admin.dto";
import { Result } from "../../../domain/shared/result";
import { IStorageService } from "../../services/storage/storage.service";
import { Auction } from "../../../domain/auction/auction.entity";

export class GetAdminAuctionsUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    public async execute(
        page: number,
        limit: number,
        filters?: {
            status?: string;
            search?: string;
            sellerId?: string;
            categoryId?: string;
        },
        sort?: {
            field: string;
            order: 'asc' | 'desc';
        }
    ): Promise<Result<AdminAuctionListResponseDto>> {
        const { auctions, total } = await this.auctionRepository.findAllPaginatedAndFiltered(page, limit, filters, sort);

        // Enrich asset URLs with presigned links
        const enrichedAuctions = await Promise.all(auctions.map(async (auction) => {
            const assetsWithSignedUrls = await Promise.all(auction.assets.map(async (asset) => {
                if (asset.url.startsWith("http")) return asset;
                try {
                    const signedUrl = await this.storageService.getPresignedDownloadUrl(asset.url);
                    return { ...asset, url: signedUrl };
                } catch (e) {
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

        return Result.ok<AdminAuctionListResponseDto>({
            auctions: enrichedAuctions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
