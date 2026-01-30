import { Auction, AuctionAsset } from "../auction.entity";
import { TransactionContext } from "../../shared/transaction";

export interface UpdateAuctionDto {
    title?: string;
    description?: string;
    startAt?: Date;
    endAt?: Date;
    startPrice?: number;
    minBidIncrement?: number;
    categoryId?: string | null;
    conditionId?: string | null;
    isPaused?: boolean;
    status?: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
}

export interface IAuctionRepository {
    create(auction: Auction): Promise<Auction>;
    findById(auctionId: string): Promise<Auction | null>;
    findBySellerId(sellerId: string): Promise<Auction[]>;
    findActive(): Promise<Auction[]>;
    findAll(): Promise<Auction[]>;
    updateStatus(auctionId: string, status: Auction['status']): Promise<Auction>;
    update(auctionId: string, dto: UpdateAuctionDto): Promise<Auction>;
    addAssets(auctionId: string, assets: AuctionAsset[]): Promise<void>;
    updateCurrentPrice(auctionId: string, currentPrice: number, tx?: TransactionContext): Promise<void>;
    findByIdForUpdate(auctionId: string, tx: TransactionContext): Promise<Auction | null>;
}
