import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";

export class PublishAuctionUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(auctionId: string, sellerId: string): Promise<Auction> {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.sellerId !== sellerId) {
            throw new Error("Auction not found");
        }

        if (auction.status === 'ACTIVE') {
            return auction;
        }

        if (auction.status !== 'DRAFT') {
            throw new Error("Only draft auctions can be published");
        }

        return await this.auctionRepository.updateStatus(auctionId, 'ACTIVE');
    }
}
