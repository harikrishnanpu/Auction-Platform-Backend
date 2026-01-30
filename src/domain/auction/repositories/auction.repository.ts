import { Auction } from "../auction.entity";

export interface IAuctionRepository {
    create(auction: Auction): Promise<Auction>;
    findById(auctionId: string): Promise<Auction | null>;
    findBySellerId(sellerId: string): Promise<Auction[]>;
    findActive(): Promise<Auction[]>;
}
