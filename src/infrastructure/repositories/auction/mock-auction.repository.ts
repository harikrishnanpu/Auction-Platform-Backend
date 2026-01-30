import { Auction } from "../../../domain/auction/auction.entity";
import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";

export class MockAuctionRepository implements IAuctionRepository {
    async create(auction: Auction): Promise<Auction> {
        console.log("Saving auction to DB (Mock):", auction);
        // Simulate DB save
        return auction;
    }

    async findById(auctionId: string): Promise<Auction | null> {
        return null; // Mock
    }
}
