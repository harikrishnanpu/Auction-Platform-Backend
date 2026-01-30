"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuctionConditionRepository = void 0;
const auction_condition_entity_1 = require("../../../domain/auction/auction-condition.entity");
class PrismaAuctionConditionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const conditions = await this.prisma.auctionCondition.findMany({
            orderBy: { name: 'asc' },
        });
        return conditions.map(cond => new auction_condition_entity_1.AuctionCondition(cond.id, cond.name, cond.description, cond.created_at));
    }
    async findById(id) {
        const condition = await this.prisma.auctionCondition.findUnique({
            where: { id },
        });
        if (!condition)
            return null;
        return new auction_condition_entity_1.AuctionCondition(condition.id, condition.name, condition.description, condition.created_at);
    }
    async create(condition) {
        const created = await this.prisma.auctionCondition.create({
            data: {
                id: condition.id,
                name: condition.name,
                description: condition.description,
                created_at: condition.createdAt,
            },
        });
        return new auction_condition_entity_1.AuctionCondition(created.id, created.name, created.description, created.created_at);
    }
    async update(id, data) {
        const updated = await this.prisma.auctionCondition.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
            },
        });
        return new auction_condition_entity_1.AuctionCondition(updated.id, updated.name, updated.description, updated.created_at);
    }
    async delete(id) {
        await this.prisma.auctionCondition.delete({
            where: { id },
        });
    }
}
exports.PrismaAuctionConditionRepository = PrismaAuctionConditionRepository;
