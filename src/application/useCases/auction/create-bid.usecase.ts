import { IAuctionRepository } from "../../../domain/entities/auction/repositories/auction.repository";
import { IBidRepository, BidEntity } from "../../../domain/entities/auction/repositories/bid.repository";

export class CreateBidUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository
    ) { }

    async execute(auctionId: string, userId: string, amount: number): Promise<BidEntity> {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.status !== 'ACTIVE') {
            throw new Error("Auction not available");
        }

        const minRequired = auction.currentPrice + auction.minBidIncrement;
        if (amount < minRequired) {
            throw new Error(`Bid must be at least ${minRequired}`);
        }

        return await this.bidRepository.createBid(auctionId, userId, amount);
    }
}
