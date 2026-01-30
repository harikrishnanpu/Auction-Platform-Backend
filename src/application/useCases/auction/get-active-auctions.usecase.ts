import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";
import { IStorageService } from "../../services/storage/storage.service";

export class GetActiveAuctionsUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private storageService: IStorageService
    ) { }

    async execute(): Promise<Auction[]> {
        const auctions = await this.auctionRepository.findActive();

        // Enrich media URLs with presigned links
        return await Promise.all(auctions.map(async (auction) => {
            const mediaWithSignedUrls = await Promise.all(auction.media.map(async (m) => {
                // If the URL looks like a full URL (already signed or public), leave it. 
                // But we know we are storing Keys.
                // Simple check: does it start with http?
                if (m.url.startsWith('http')) return m;

                const signedUrl = await this.storageService.getPresignedDownloadUrl(m.url);
                // Return a new object with the updated URL. 
                // AuctionMedia is immutable-ish (readonly props), so we clone.
                // But wait, the Entity properties are readonly. 
                // We should probably map to a DTO or just hack it for the response since this is the Application layer.
                // Or create a new AuctionMedia instance.
                return { ...m, url: signedUrl };
            }));

            // Return new Auction-like object or modify (casting to any to bypass readonly if needed, or re-instantiate)
            // Re-instantiating is cleaner but verbose. 
            // Let's return a plain object or 'any' that looks like Auction for the controller.
            return {
                ...auction,
                media: mediaWithSignedUrls
            } as any as Auction;
        }));
    }
}
