import { AuctionParticipant, PrismaClient } from "@prisma/client";
import { AuctionParticipantEntity, IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";

export class PrismaAuctionParticipantRepository implements IAuctionParticipantRepository {
    constructor(private prisma: PrismaClient) { }

    async findByAuctionAndUser(auctionId: string, userId: string): Promise<AuctionParticipantEntity | null> {
        const found = await this.prisma.auctionParticipant.findUnique({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return found ? this.map(found) : null;
    }

    async upsertParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity> {
        const participant = await this.prisma.auctionParticipant.upsert({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            update: { revoked_at: null, last_seen: new Date() },
            create: { auction_id: auctionId, user_id: userId },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return this.map(participant);
    }

    async revokeParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity> {
        const participant = await this.prisma.auctionParticipant.update({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            data: { revoked_at: new Date(), is_online: false },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return this.map(participant);
    }

    async listActiveParticipants(auctionId: string): Promise<AuctionParticipantEntity[]> {
        const participants = await this.prisma.auctionParticipant.findMany({
            where: { auction_id: auctionId, revoked_at: null },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return participants.map((p) => this.map(p));
    }

    async setOnlineStatus(auctionId: string, userId: string, isOnline: boolean, socketId?: string): Promise<void> {
        await this.prisma.auctionParticipant.updateMany({
            where: { auction_id: auctionId, user_id: userId },
            data: {
                is_online: isOnline,
                last_seen: new Date(),
                socket_id: socketId || null
            }
        });
    }

    async updateLastSeen(auctionId: string, userId: string): Promise<void> {
        await this.prisma.auctionParticipant.updateMany({
            where: { auction_id: auctionId, user_id: userId },
            data: { last_seen: new Date() }
        });
    }

    async listParticipantsWithStatus(auctionId: string): Promise<AuctionParticipantEntity[]> {
        const participants = await this.prisma.auctionParticipant.findMany({
            where: { auction_id: auctionId },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } },
            orderBy: [{ is_online: 'desc' }, { last_seen: 'desc' }]
        });
        return participants.map((p) => this.map(p));
    }

    private map(participant: any): AuctionParticipantEntity {
        return {
            id: participant.id,
            auctionId: participant.auction_id,
            userId: participant.user_id,
            joinedAt: participant.joined_at,
            revokedAt: participant.revoked_at,
            isOnline: participant.is_online,
            lastSeen: participant.last_seen,
            socketId: participant.socket_id,
            user: participant.User ? {
                user_id: participant.User.user_id,
                username: participant.User.name,
                email: participant.User.email,
                profile_image: participant.User.avatar_url
            } : undefined
        };
    }
}
