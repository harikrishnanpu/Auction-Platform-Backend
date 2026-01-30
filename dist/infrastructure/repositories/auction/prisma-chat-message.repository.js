"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaChatMessageRepository = void 0;
class PrismaChatMessageRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMessage(auctionId, userId, message) {
        const created = await this.prisma.auctionChatMessage.create({
            data: {
                auction_id: auctionId,
                user_id: userId,
                message
            }
        });
        return {
            id: created.id,
            auctionId: created.auction_id,
            userId: created.user_id,
            message: created.message,
            createdAt: created.created_at
        };
    }
    async findLatestByAuction(auctionId, limit) {
        const messages = await this.prisma.auctionChatMessage.findMany({
            where: { auction_id: auctionId },
            orderBy: { created_at: 'desc' },
            take: limit
        });
        return messages.map((m) => ({
            id: m.id,
            auctionId: m.auction_id,
            userId: m.user_id,
            message: m.message,
            createdAt: m.created_at
        }));
    }
}
exports.PrismaChatMessageRepository = PrismaChatMessageRepository;
