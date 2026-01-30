"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuctionCategoryRepository = void 0;
const auction_category_entity_1 = require("../../../domain/auction/auction-category.entity");
class PrismaAuctionCategoryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const categories = await this.prisma.auctionCategory.findMany({
            orderBy: { name: 'asc' },
        });
        return categories.map(cat => new auction_category_entity_1.AuctionCategory(cat.id, cat.name, cat.slug, cat.is_active, cat.created_at));
    }
    async findById(id) {
        const category = await this.prisma.auctionCategory.findUnique({
            where: { id },
        });
        if (!category)
            return null;
        return new auction_category_entity_1.AuctionCategory(category.id, category.name, category.slug, category.is_active, category.created_at);
    }
    async findBySlug(slug) {
        const category = await this.prisma.auctionCategory.findUnique({
            where: { slug },
        });
        if (!category)
            return null;
        return new auction_category_entity_1.AuctionCategory(category.id, category.name, category.slug, category.is_active, category.created_at);
    }
    async findActive() {
        const categories = await this.prisma.auctionCategory.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' },
        });
        return categories.map(cat => new auction_category_entity_1.AuctionCategory(cat.id, cat.name, cat.slug, cat.is_active, cat.created_at));
    }
    async create(category) {
        const created = await this.prisma.auctionCategory.create({
            data: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                is_active: category.isActive,
                created_at: category.createdAt,
            },
        });
        return new auction_category_entity_1.AuctionCategory(created.id, created.name, created.slug, created.is_active, created.created_at);
    }
    async update(id, data) {
        const updated = await this.prisma.auctionCategory.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.slug && { slug: data.slug }),
                ...(data.isActive !== undefined && { is_active: data.isActive }),
            },
        });
        return new auction_category_entity_1.AuctionCategory(updated.id, updated.name, updated.slug, updated.is_active, updated.created_at);
    }
    async delete(id) {
        await this.prisma.auctionCategory.delete({
            where: { id },
        });
    }
}
exports.PrismaAuctionCategoryRepository = PrismaAuctionCategoryRepository;
