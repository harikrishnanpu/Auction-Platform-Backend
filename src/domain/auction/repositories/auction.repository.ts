import { Auction, AuctionAsset } from "../auction.entity";
import { TransactionContext } from "../../shared/transaction";

export interface IAuctionRepository {
    create(auction: Auction): Promise<Auction>;
    findById(auctionId: string): Promise<Auction | null>;
    findBySellerId(sellerId: string): Promise<Auction[]>;
    findActive(): Promise<Auction[]>;
    updateStatus(auctionId: string, status: Auction['status']): Promise<Auction>;
    addAssets(auctionId: string, assets: AuctionAsset[]): Promise<void>;
    updateCurrentPrice(auctionId: string, currentPrice: number, tx?: TransactionContext): Promise<void>;
    findByIdForUpdate(auctionId: string, tx: TransactionContext): Promise<Auction | null>;
}
