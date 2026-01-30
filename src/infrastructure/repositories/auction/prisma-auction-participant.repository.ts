import { AuctionParticipant, PrismaClient } from "@prisma/client";
import { AuctionParticipantEntity, IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";

export class PrismaAuctionParticipantRepository implements IAuctionParticipantRepository {
    constructor(private prisma: PrismaClient) { }

    async findByAuctionAndUser(auctionId: string, userId: string): Promise<AuctionParticipantEntity | null> {
        const found = await this.prisma.auctionParticipant.findUnique({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } }
        });
        return found ? this.map(found) : null;
    }

    async upsertParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity> {
        const participant = await this.prisma.auctionParticipant.upsert({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            update: { revoked_at: null },
            create: { auction_id: auctionId, user_id: userId }
        });
        return this.map(participant);
    }

    async revokeParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity> {
        const participant = await this.prisma.auctionParticipant.update({
            where: { auction_id_user_id: { auction_id: auctionId, user_id: userId } },
            data: { revoked_at: new Date() }
        });
        return this.map(participant);
    }

    async listActiveParticipants(auctionId: string): Promise<AuctionParticipantEntity[]> {
        const participants = await this.prisma.auctionParticipant.findMany({
            where: { auction_id: auctionId, revoked_at: null }
        });
        return participants.map((p) => this.map(p));
    }

    private map(participant: AuctionParticipant): AuctionParticipantEntity {
        return {
            id: participant.id,
            auctionId: participant.auction_id,
            userId: participant.user_id,
            joinedAt: participant.joined_at,
            revokedAt: participant.revoked_at
        };
    }
}
