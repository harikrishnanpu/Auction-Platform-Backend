"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaOfferRepository = void 0;
class PrismaOfferRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const offer = await this.prisma.auctionOffer.create({
            data: {
                auction_id: data.auctionId,
                user_id: data.userId,
                bid_amount: data.bidAmount,
                offer_rank: data.offerRank,
                expires_at: data.expiresAt,
                status: 'PENDING'
            }
        });
        return this.toDomain(offer);
    }
    async findById(id) {
        const offer = await this.prisma.auctionOffer.findUnique({
            where: { id }
        });
        return offer ? this.toDomain(offer) : null;
    }
    async findByAuctionId(auctionId) {
        const offers = await this.prisma.auctionOffer.findMany({
            where: { auction_id: auctionId },
            orderBy: { offer_rank: 'asc' }
        });
        return offers.map(o => this.toDomain(o));
    }
    async findPendingByUser(userId) {
        const offers = await this.prisma.auctionOffer.findMany({
            where: {
                user_id: userId,
                status: 'PENDING'
            },
            orderBy: { created_at: 'desc' }
        });
        return offers.map(o => this.toDomain(o));
    }
    async findPendingByAuction(auctionId) {
        const offers = await this.prisma.auctionOffer.findMany({
            where: {
                auction_id: auctionId,
                status: 'PENDING'
            },
            orderBy: { offer_rank: 'asc' }
        });
        return offers.map(o => this.toDomain(o));
    }
    async findExpired() {
        const now = new Date();
        const offers = await this.prisma.auctionOffer.findMany({
            where: {
                status: 'PENDING',
                expires_at: {
                    lte: now
                }
            }
        });
        return offers.map(o => this.toDomain(o));
    }
    async update(id, data) {
        const offer = await this.prisma.auctionOffer.update({
            where: { id },
            data: {
                status: data.status,
                responded_at: data.respondedAt
            }
        });
        return this.toDomain(offer);
    }
    async delete(id) {
        await this.prisma.auctionOffer.delete({
            where: { id }
        });
    }
    toDomain(offer) {
        return {
            id: offer.id,
            auctionId: offer.auction_id,
            userId: offer.user_id,
            bidAmount: offer.bid_amount,
            offerRank: offer.offer_rank,
            status: offer.status,
            offeredAt: offer.offered_at,
            respondedAt: offer.responded_at,
            expiresAt: offer.expires_at,
            createdAt: offer.created_at,
            updatedAt: offer.updated_at
        };
    }
}
exports.PrismaOfferRepository = PrismaOfferRepository;
