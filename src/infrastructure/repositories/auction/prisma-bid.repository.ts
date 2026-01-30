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
                amount,
                is_valid: true
            }
        });

        return {
            id: created.id,
            auctionId: created.auction_id,
            userId: created.user_id,
            amount: created.amount,
            isValid: created.is_valid,
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
            isValid: b.is_valid,
            createdAt: b.created_at
        }));
    }

    async findLatestValidByAuction(auctionId: string, limit: number): Promise<BidEntity[]> {
        const bids = await this.prisma.bid.findMany({
            where: { 
                auction_id: auctionId,
                is_valid: true
            },
            orderBy: { created_at: 'desc' },
            take: limit
        });

        return bids.map((b: Bid) => ({
            id: b.id,
            auctionId: b.auction_id,
            userId: b.user_id,
            amount: b.amount,
            isValid: b.is_valid,
            createdAt: b.created_at
        }));
    }

    async findByUserInAuction(auctionId: string, userId: string, limit: number): Promise<BidEntity[]> {
        const bids = await this.prisma.bid.findMany({
            where: { 
                auction_id: auctionId, 
                user_id: userId 
            },
            orderBy: { created_at: 'desc' },
            take: limit
        });

        return bids.map((b: Bid) => ({
            id: b.id,
            auctionId: b.auction_id,
            userId: b.user_id,
            amount: b.amount,
            isValid: b.is_valid,
            createdAt: b.created_at
        }));
    }

    async invalidateUserBids(auctionId: string, userId: string, tx?: TransactionContext): Promise<number> {
        const client = (tx as Prisma.TransactionClient) || this.prisma;
        const result = await client.bid.updateMany({
            where: {
                auction_id: auctionId,
                user_id: userId,
                is_valid: true
            },
            data: {
                is_valid: false
            }
        });
        return result.count;
    }

    async findHighestValidBid(auctionId: string, tx?: TransactionContext): Promise<BidEntity | null> {
        const client = (tx as Prisma.TransactionClient) || this.prisma;
        const bid = await client.bid.findFirst({
            where: {
                auction_id: auctionId,
                is_valid: true
            },
            orderBy: { amount: 'desc' }
        });
        
        if (!bid) return null;

        return {
            id: bid.id,
            auctionId: bid.auction_id,
            userId: bid.user_id,
            amount: bid.amount,
            isValid: bid.is_valid,
            createdAt: bid.created_at
        };
    }

    async countUserBids(auctionId: string, userId: string): Promise<number> {
        return await this.prisma.bid.count({
            where: {
                auction_id: auctionId,
                user_id: userId,
                is_valid: true
            }
        });
    }
}
