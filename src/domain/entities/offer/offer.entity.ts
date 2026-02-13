export interface OfferEntity {
    id: string;
    auctionId: string;
    userId: string;
    bidAmount: number;
    offerRank: number;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    offeredAt: Date;
    respondedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateOfferDTO = {
    auctionId: string;
    userId: string;
    bidAmount: number;
    offerRank: number;
    expiresAt: Date;
};

export type UpdateOfferDTO = {
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    respondedAt?: Date;
};
