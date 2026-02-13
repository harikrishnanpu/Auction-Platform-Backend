import { TransactionContext } from "../../../shared/transaction";
export interface BidEntity {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    isValid: boolean;
    createdAt: Date;
}

export interface IBidRepository {
    createBid(auctionId: string, userId: string, amount: number, tx?: TransactionContext): Promise<BidEntity>;
    findLatestByAuction(auctionId: string, limit: number): Promise<BidEntity[]>;
    findLatestValidByAuction(auctionId: string, limit: number): Promise<BidEntity[]>;
    findByUserInAuction(auctionId: string, userId: string, limit: number): Promise<BidEntity[]>;
    invalidateUserBids(auctionId: string, userId: string, tx?: TransactionContext): Promise<number>;
    findHighestValidBid(auctionId: string, tx?: TransactionContext): Promise<BidEntity | null>;
    countUserBids(auctionId: string, userId: string): Promise<number>;
}
