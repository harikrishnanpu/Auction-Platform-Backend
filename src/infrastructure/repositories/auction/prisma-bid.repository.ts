import { Bid, Prisma, PrismaClient } from "@prisma/client";
import { BidEntity, IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { TransactionContext } from "../../../domain/shared/transaction";

export class PrismaBidRepository implements IBidRepository {
    constructor(private prisma: PrismaClient) { }

    async createBid(auctionId: string, userId: string, amount: number, tx?: TransactionContext): Promise<BidEntity> {
        const client = (tx as Prisma.TransactionClient) || this.prisma;
        const created = await client.bid.create({
            data: {
                auction_id: auctionId,
                user_id: userId,
                amount
            }
        });

        return {
            id: created.id,
            auctionId: created.auction_id,
            userId: created.user_id,
            amount: created.amount,
            createdAt: created.created_at
        };
    }

    async findLatestByAuction(auctionId: string, limit: number): Promise<BidEntity[]> {
        const bids = await this.prisma.bid.findMany({
            where: { auction_id: auctionId },
            orderBy: { created_at: 'desc' },
            take: limit
        });

        return bids.map((b: Bid) => ({
            id: b.id,
            auctionId: b.auction_id,
            userId: b.user_id,
            amount: b.amount,
            createdAt: b.created_at
        }));
    }
}
