export interface AuctionParticipantEntity {
    id: string;
    auctionId: string;
    userId: string;
    joinedAt: Date;
    revokedAt?: Date | null;
}

export interface IAuctionParticipantRepository {
    findByAuctionAndUser(auctionId: string, userId: string): Promise<AuctionParticipantEntity | null>;
    upsertParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity>;
    revokeParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity>;
    listActiveParticipants(auctionId: string): Promise<AuctionParticipantEntity[]>;
}
