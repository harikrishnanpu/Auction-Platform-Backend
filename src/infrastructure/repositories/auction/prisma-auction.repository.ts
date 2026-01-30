import { Auction, AuctionAsset } from "../../../domain/auction/auction.entity";
import { IAuctionRepository, UpdateAuctionDto } from "../../../domain/auction/repositories/auction.repository";
import { TransactionContext } from "../../../domain/shared/transaction";
import { Prisma, PrismaClient } from "@prisma/client";

export class PrismaAuctionRepository implements IAuctionRepository {
    constructor(private prisma: PrismaClient) { }

    async create(auction: Auction): Promise<Auction> {
        const created = await this.prisma.auction.create({
            data: {
                id: auction.id,
                seller_id: auction.sellerId,
                category_id: auction.categoryId,
                condition_id: auction.conditionId,
                title: auction.title,
                description: auction.description,
                start_at: auction.startAt,
                end_at: auction.endAt,
                start_price: auction.startPrice,
                min_bid_increment: auction.minBidIncrement,
                current_price: auction.currentPrice,
                status: auction.status,
                is_paused: auction.isPaused,
                created_at: auction.createdAt,
                updated_at: auction.updatedAt
            },
            include: {
                assets: true
            }
        });

        return this.mapToEntity(created);
    }

    async findById(auctionId: string): Promise<Auction | null> {
        const found = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: { assets: true }
        });

        if (!found) return null;
        return this.mapToEntity(found);
    }

    async findBySellerId(sellerId: string): Promise<Auction[]> {
        const auctions = await this.prisma.auction.findMany({
            where: { seller_id: sellerId },
            include: { assets: true },
            orderBy: { created_at: "desc" }
        });
        return auctions.map(a => this.mapToEntity(a));
    }

    async findActive(): Promise<Auction[]> {
        const auctions = await this.prisma.auction.findMany({
            where: { status: "ACTIVE" },
            include: { assets: true },
            orderBy: { created_at: "desc" }
        });
        return auctions.map(a => this.mapToEntity(a));
    }

    async updateStatus(auctionId: string, status: Auction['status']): Promise<Auction> {
        const updated = await this.prisma.auction.update({
            where: { id: auctionId },
            data: { status, updated_at: new Date() },
            include: { assets: true }
        });
        return this.mapToEntity(updated);
    }

    async update(auctionId: string, dto: UpdateAuctionDto): Promise<Auction> {
        const data: any = { updated_at: new Date() };
        if (dto.title != null) data.title = dto.title;
        if (dto.description != null) data.description = dto.description;
        if (dto.startAt != null) data.start_at = dto.startAt;
        if (dto.endAt != null) data.end_at = dto.endAt;
        if (dto.startPrice != null) data.start_price = dto.startPrice;
        if (dto.minBidIncrement != null) data.min_bid_increment = dto.minBidIncrement;
        if (dto.categoryId !== undefined) data.category_id = dto.categoryId;
        if (dto.conditionId !== undefined) data.condition_id = dto.conditionId;
        if (dto.isPaused !== undefined) data.is_paused = dto.isPaused;
        if (dto.status !== undefined) data.status = dto.status;
        const updated = await this.prisma.auction.update({
            where: { id: auctionId },
            data,
            include: { assets: true }
        });
        return this.mapToEntity(updated);
    }

    async addAssets(auctionId: string, assets: AuctionAsset[]): Promise<void> {
        if (assets.length === 0) return;
        await this.prisma.auctionAsset.createMany({
            data: assets.map((asset) => ({
                id: asset.id,
                auction_id: auctionId,
                asset_type: asset.assetType,
                url: asset.url,
                position: asset.position,
                created_at: asset.createdAt
            }))
        });
    }

    async updateCurrentPrice(auctionId: string, currentPrice: number, tx?: TransactionContext): Promise<void> {
        const client = (tx as Prisma.TransactionClient) || this.prisma;
        await client.auction.update({
            where: { id: auctionId },
            data: { current_price: currentPrice, updated_at: new Date() }
        });
    }

    async findByIdForUpdate(auctionId: string, tx: TransactionContext): Promise<Auction | null> {
        const client = tx as Prisma.TransactionClient;
        await client.$queryRaw`SELECT id FROM "auctions" WHERE id = ${auctionId} FOR UPDATE`;
        const found = await client.auction.findUnique({
            where: { id: auctionId },
            include: { assets: true }
        });
        if (!found) return null;
        return this.mapToEntity(found);
    }

    async findAll(): Promise<Auction[]> {
        const auctions = await this.prisma.auction.findMany({
            include: { assets: true },
            orderBy: { created_at: "desc" }
        });
        return auctions.map(a => this.mapToEntity(a));
    }

    private mapToEntity(data: any): Auction {
        const assets = (data.assets || []).map((asset: any) => new AuctionAsset(
            asset.id,
            asset.auction_id,
            asset.asset_type,
            asset.url,
            asset.position,
            asset.created_at
        ));

        return new Auction(
            data.id,
            data.seller_id,
            data.category_id,
            data.condition_id,
            data.title,
            data.description,
            data.start_at,
            data.end_at,
            data.start_price,
            data.min_bid_increment,
            data.current_price,
            assets,
            data.status,
            data.is_paused,
            data.created_at,
            data.updated_at
        );
    }
}
