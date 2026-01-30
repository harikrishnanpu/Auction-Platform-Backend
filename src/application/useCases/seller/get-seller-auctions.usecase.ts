import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";
import { IStorageService } from "../../services/storage/storage.service";

export class GetSellerAuctionsUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(sellerId: string): Promise<Auction[]> {
        const auctions = await this.auctionRepository.findBySellerId(sellerId);

        // Enrich media URLs with presigned links
        return await Promise.all(auctions.map(async (auction) => {
            const mediaWithSignedUrls = await Promise.all(auction.media.map(async (m) => {
                if (m.url.startsWith('http')) return m;
                const signedUrl = await this.storageService.getPresignedDownloadUrl(m.url);
                return { ...m, url: signedUrl };
            }));

            return {
                ...auction,
                media: mediaWithSignedUrls
            } as any as Auction;
        }));
    }
}
