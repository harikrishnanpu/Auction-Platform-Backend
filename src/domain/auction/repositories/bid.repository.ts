import { TransactionContext } from "../../shared/transaction";
export interface BidEntity {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    createdAt: Date;
}

export interface IBidRepository {
    createBid(auctionId: string, userId: string, amount: number, tx?: TransactionContext): Promise<BidEntity>;
    findLatestByAuction(auctionId: string, limit: number): Promise<BidEntity[]>;
}
