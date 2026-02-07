import { AuctionChatMessage, PrismaClient } from "@prisma/client";
import { ChatMessageEntity, IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";

export class PrismaChatMessageRepository implements IChatMessageRepository {
    constructor(private prisma: PrismaClient) { }

    async createMessage(auctionId: string, userId: string, message: string): Promise<ChatMessageEntity> {
        const created = await this.prisma.auctionChatMessage.create({
            data: {
                auction_id: auctionId,
                user_id: userId,
                message
            },
            include: {
                User: {
                    select: {
                        name: true,
                        avatar_url: true
                    }
                }
            }
        });

        return {
            id: created.id,
            auctionId: created.auction_id,
            userId: created.user_id,
            message: created.message,
            createdAt: created.created_at,
            username: (created as any).User?.name,
            userAvatar: (created as any).User?.avatar_url
        };
    }

    async findLatestByAuction(auctionId: string, limit: number): Promise<ChatMessageEntity[]> {
        const messages = await this.prisma.auctionChatMessage.findMany({
            where: { auction_id: auctionId },
            include: {
                User: {
                    select: {
                        name: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit
        });

        return messages.map((m: any) => ({
            id: m.id,
            auctionId: m.auction_id,
            userId: m.user_id,
            message: m.message,
            createdAt: m.created_at,
            username: m.User?.name,
            userAvatar: m.User?.avatar_url
        }));
    }
}
