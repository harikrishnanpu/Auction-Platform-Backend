"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuctionRepository = void 0;
const auction_entity_1 = require("../../../domain/auction/auction.entity");
class PrismaAuctionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(auction) {
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
    async findById(auctionId) {
        const found = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: { assets: true }
        });
        if (!found)
            return null;
        return this.mapToEntity(found);
    }
    async findBySellerId(sellerId) {
        const auctions = await this.prisma.auction.findMany({
            where: { seller_id: sellerId },
            include: { assets: true },
            orderBy: { created_at: "desc" }
        });
        return auctions.map(a => this.mapToEntity(a));
    }
    async findActive() {
        const auctions = await this.prisma.auction.findMany({
            where: { status: "ACTIVE" },
            include: { assets: true },
            orderBy: { created_at: "desc" }
        });
        return auctions.map(a => this.mapToEntity(a));
    }
    async updateStatus(auctionId, status) {
        const updated = await this.prisma.auction.update({
            where: { id: auctionId },
            data: { status, updated_at: new Date() },
            include: { assets: true }
        });
        return this.mapToEntity(updated);
    }
    async update(auctionId, dto) {
        const data = { updated_at: new Date() };
        if (dto.title != null)
            data.title = dto.title;
        if (dto.description != null)
            data.description = dto.description;
        if (dto.startAt != null)
            data.start_at = dto.startAt;
        if (dto.endAt != null)
            data.end_at = dto.endAt;
        if (dto.startPrice != null)
            data.start_price = dto.startPrice;
        if (dto.minBidIncrement != null)
            data.min_bid_increment = dto.minBidIncrement;
        if (dto.categoryId !== undefined)
            data.category_id = dto.categoryId;
        if (dto.conditionId !== undefined)
            data.condition_id = dto.conditionId;
        if (dto.isPaused !== undefined)
            data.is_paused = dto.isPaused;
        if (dto.status !== undefined)
            data.status = dto.status;
        const updated = await this.prisma.auction.update({
            where: { id: auctionId },
            data,
            include: { assets: true }
        });
        return this.mapToEntity(updated);
    }
    async addAssets(auctionId, assets) {
        if (assets.length === 0)
            return;
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
    async updateCurrentPrice(auctionId, currentPrice, tx) {
        const client = tx || this.prisma;
        await client.auction.update({
            where: { id: auctionId },
            data: { current_price: currentPrice, updated_at: new Date() }
        });
    }
    async findByIdForUpdate(auctionId, tx) {
        const client = tx;
        await client.$queryRaw `SELECT id FROM "auctions" WHERE id = ${auctionId} FOR UPDATE`;
        const found = await client.auction.findUnique({
            where: { id: auctionId },
            include: { assets: true }
        });
        if (!found)
            return null;
        return this.mapToEntity(found);
    }
    async extendAuction(auctionId, newEndTime, extensionCount, tx) {
        const prismaContext = tx ? tx : this.prisma;
        await prismaContext.auction.update({
            where: { id: auctionId },
            data: {
                end_at: newEndTime,
                extension_count: extensionCount
            }
        });
    }
    async findAll() {
        const auctions = await this.prisma.auction.findMany({
            include: { assets: true },
            orderBy: { created_at: "desc" }
        });
        return auctions.map(a => this.mapToEntity(a));
    }
    async findAllPaginatedAndFiltered(page, limit, filters, sort) {
        const skip = (page - 1) * limit;
        const take = limit;
        const where = {};
        if (filters?.status) {
            // @ts-ignore
            where.status = filters.status;
        }
        if (filters?.sellerId) {
            where.seller_id = filters.sellerId;
        }
        if (filters?.categoryId) {
            where.category_id = filters.categoryId;
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        const orderBy = {};
        if (sort?.field) {
            let field = sort.field;
            // Map frontend field names to DB column names if necessary
            if (field === 'createdAt')
                field = 'created_at';
            else if (field === 'currentPrice')
                field = 'current_price';
            else if (field === 'title')
                field = 'title';
            else if (field === 'status')
                field = 'status';
            // @ts-ignore
            orderBy[field] = sort.order;
        }
        else {
            orderBy.created_at = 'desc';
        }
        const [auctions, total] = await Promise.all([
            this.prisma.auction.findMany({
                where,
                skip,
                take,
                orderBy,
                include: { assets: true }
            }),
            this.prisma.auction.count({ where })
        ]);
        return {
            auctions: auctions.map(a => this.mapToEntity(a)),
            total
        };
    }
    mapToEntity(data) {
        const assets = (data.assets || []).map((asset) => new auction_entity_1.AuctionAsset(asset.id, asset.auction_id, asset.asset_type, asset.url, asset.position, asset.created_at));
        return new auction_entity_1.Auction(data.id, data.seller_id, data.category_id, data.condition_id, data.title, data.description, data.start_at, data.end_at, data.start_price, data.min_bid_increment, data.current_price, assets, data.status, data.is_paused, data.extension_count || 0, data.created_at, data.updated_at);
    }
}
exports.PrismaAuctionRepository = PrismaAuctionRepository;
