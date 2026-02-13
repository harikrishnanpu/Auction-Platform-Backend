"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuctionParticipantRepository = void 0;
class PrismaAuctionParticipantRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByAuctionAndUser(auctionId, userId) {
        const found = await this.prisma.auctionParticipant.findUnique({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return found ? this.map(found) : null;
    }
    async upsertParticipant(auctionId, userId) {
        const participant = await this.prisma.auctionParticipant.upsert({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            update: { revoked_at: null, last_seen: new Date() },
            create: { auction_id: auctionId, user_id: userId },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return this.map(participant);
    }
    async revokeParticipant(auctionId, userId) {
        const participant = await this.prisma.auctionParticipant.update({
            where: {
                auction_id_user_id: {
                    auction_id: auctionId,
                    user_id: userId
                }
            },
            data: {
                revoked_at: new Date()
            },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return this.map(participant);
    }
    async unrevokeParticipant(auctionId, userId) {
        const participant = await this.prisma.auctionParticipant.update({
            where: {
                auction_id_user_id: {
                    auction_id: auctionId,
                    user_id: userId
                }
            },
            data: {
                revoked_at: null
            },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return this.map(participant);
    }
    async listActiveParticipants(auctionId) {
        const participants = await this.prisma.auctionParticipant.findMany({
            where: { auction_id: auctionId, revoked_at: null },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } }
        });
        return participants.map((p) => this.map(p));
    }
    async setOnlineStatus(auctionId, userId, isOnline, socketId) {
        await this.prisma.auctionParticipant.updateMany({
            where: { auction_id: auctionId, user_id: userId },
            data: {
                is_online: isOnline,
                last_seen: new Date(),
                socket_id: socketId || null
            }
        });
    }
    async updateLastSeen(auctionId, userId) {
        await this.prisma.auctionParticipant.updateMany({
            where: { auction_id: auctionId, user_id: userId },
            data: { last_seen: new Date() }
        });
    }
    async listParticipantsWithStatus(auctionId) {
        const participants = await this.prisma.auctionParticipant.findMany({
            where: { auction_id: auctionId },
            include: { User: { select: { user_id: true, name: true, email: true, avatar_url: true } } },
            orderBy: [{ is_online: 'desc' }, { last_seen: 'desc' }]
        });
        return participants.map((p) => this.map(p));
    }
    map(participant) {
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
exports.PrismaAuctionParticipantRepository = PrismaAuctionParticipantRepository;
