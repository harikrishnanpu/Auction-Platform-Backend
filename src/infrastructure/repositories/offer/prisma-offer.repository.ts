import { PrismaClient } from '@prisma/client';
import { IOfferRepository } from '../../../domain/entities/offer/offer.repository';
import { OfferEntity, CreateOfferDTO, UpdateOfferDTO } from '../../../domain/entities/offer/offer.entity';

export class PrismaOfferRepository implements IOfferRepository {
    constructor(private prisma: PrismaClient) { }

    async create(data: CreateOfferDTO): Promise<OfferEntity> {
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

    async findById(id: string): Promise<OfferEntity | null> {
        const offer = await this.prisma.auctionOffer.findUnique({
            where: { id }
        });
        return offer ? this.toDomain(offer) : null;
    }

    async findByAuctionId(auctionId: string): Promise<OfferEntity[]> {
        const offers = await this.prisma.auctionOffer.findMany({
            where: { auction_id: auctionId },
            orderBy: { offer_rank: 'asc' }
        });
        return offers.map(o => this.toDomain(o));
    }

    async findPendingByUser(userId: string): Promise<OfferEntity[]> {
        const offers = await this.prisma.auctionOffer.findMany({
            where: {
                user_id: userId,
                status: 'PENDING'
            },
            orderBy: { created_at: 'desc' }
        });
        return offers.map(o => this.toDomain(o));
    }

    async findPendingByAuction(auctionId: string): Promise<OfferEntity[]> {
        const offers = await this.prisma.auctionOffer.findMany({
            where: {
                auction_id: auctionId,
                status: 'PENDING'
            },
            orderBy: { offer_rank: 'asc' }
        });
        return offers.map(o => this.toDomain(o));
    }

    async findExpired(): Promise<OfferEntity[]> {
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

    async update(id: string, data: UpdateOfferDTO): Promise<OfferEntity> {
        const offer = await this.prisma.auctionOffer.update({
            where: { id },
            data: {
                status: data.status,
                responded_at: data.respondedAt
            }
        });
        return this.toDomain(offer);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.auctionOffer.delete({
            where: { id }
        });
    }

    private toDomain(offer: any): OfferEntity {
        return {
            id: offer.id,
            auctionId: offer.auction_id,
            userId: offer.user_id,
            bidAmount: offer.bid_amount,
            offerRank: offer.offer_rank,
            status: offer.status as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
            offeredAt: offer.offered_at,
            respondedAt: offer.responded_at,
            expiresAt: offer.expires_at,
            createdAt: offer.created_at,
            updatedAt: offer.updated_at
        };
    }
}
