import { Auction, AuctionMedia } from "../../../domain/auction/auction.entity";
import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { PrismaClient } from "@prisma/client";

export class PrismaAuctionRepository implements IAuctionRepository {
    constructor(private prisma: PrismaClient) { }

    async create(auction: Auction): Promise<Auction> {
        // Create Auction and its related Media in one transaction
        const created = await this.prisma.auction.create({
            data: {
                auction_id: auction.auctionId,
                seller_id: auction.sellerId,
                title: auction.title,
                description: auction.description,
                category: auction.category,
                condition: auction.condition,
                start_price: auction.startPrice,
                min_increment: auction.minIncrement,
                start_time: auction.startTime,
                end_time: auction.endTime,
                status: auction.status,
                created_at: auction.createdAt,
                updated_at: auction.updatedAt,
                media: {
                    create: auction.media.map(m => ({
                        // id: m.id, // Let Prisma/DB generate UUIDs or use entity ones? 
                        // If entity provides IDs, use them. If not, Prisma default.
                        // Entity has IDs.
                        // id: m.id, 
                        seller_id: m.sellerId,
                        type: m.type,
                        url: m.url,
                        is_primary: m.isPrimary
                    }))
                }
            },
            include: {
                media: true
            }
        });

        return this.mapToEntity(created);
    }

    async findById(auctionId: string): Promise<Auction | null> {
        const found = await this.prisma.auction.findUnique({
            where: { auction_id: auctionId },
            include: { media: true }
        });

        if (!found) return null;
        return this.mapToEntity(found);
    }

    async findBySellerId(sellerId: string): Promise<Auction[]> {
        const auctions = await this.prisma.auction.findMany({
            where: { seller_id: sellerId },
            include: { media: true },
            orderBy: { created_at: 'desc' }
        });
        return auctions.map(a => this.mapToEntity(a));
    }

    async findActive(): Promise<Auction[]> {
        const auctions = await this.prisma.auction.findMany({
            where: { status: 'ACTIVE' },
            include: { media: true },
            orderBy: { created_at: 'desc' }
        });
        return auctions.map(a => this.mapToEntity(a));
    }

    private mapToEntity(data: any): Auction {
        const media = data.media.map((m: any) => new AuctionMedia(
            m.id,
            m.auction_id,
            m.seller_id,
            m.type,
            m.url,
            m.is_primary
        ));

        return new Auction(
            data.auction_id,
            data.seller_id,
            data.title,
            data.description,
            data.category,
            data.condition,
            data.start_price,
            data.min_increment,
            data.start_time,
            data.end_time,
            media,
            data.status,
            data.created_at,
            data.updated_at
        );
    }
}
