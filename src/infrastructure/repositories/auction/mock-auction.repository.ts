import { Auction, AuctionAsset } from "../../../domain/auction/auction.entity";
import { IAuctionRepository, UpdateAuctionDto } from "../../../domain/auction/repositories/auction.repository";
import { TransactionContext } from "../../../application/ports/transaction.port";

export class MockAuctionRepository implements IAuctionRepository {
    async create(auction: Auction): Promise<Auction> {
        console.log("Saving auction to DB (Mock):", auction);
        // Simulate DB save
        return auction;
    }

    async findById(auctionId: string): Promise<Auction | null> {
        return null; // Mock
    }

    async findBySellerId(sellerId: string): Promise<Auction[]> {
        return [];
    }

    async findActive(): Promise<Auction[]> {
        return [];
    }

    async findAll(): Promise<Auction[]> {
        return [];
    }

    async updateStatus(auctionId: string, status: Auction['status']): Promise<Auction> {
        throw new Error("Not implemented");
    }

    async update(auctionId: string, dto: UpdateAuctionDto): Promise<Auction> {
        throw new Error("Not implemented");
    }

    async addAssets(auctionId: string, assets: AuctionAsset[]): Promise<void> {
        return;
    }

    async updateCurrentPrice(auctionId: string, currentPrice: number, tx?: TransactionContext): Promise<void> {
        return;
    }

    async findByIdForUpdate(auctionId: string, tx: TransactionContext): Promise<Auction | null> {
        return null;
    }

    async extendAuction(auctionId: string, newEndTime: Date, extensionCount: number, tx?: TransactionContext): Promise<void> {
        return;
    }
}
