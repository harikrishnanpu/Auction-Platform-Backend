export interface AuctionParticipantEntity {
    id: string;
    auctionId: string;
    userId: string;
    joinedAt: Date;
    revokedAt?: Date | null;
    isOnline: boolean;
    lastSeen: Date;
    socketId?: string | null;
    user?: {
        user_id: string;
        username: string;
        email: string;
        profile_image?: string | null;
    };
}

export interface IAuctionParticipantRepository {
    findByAuctionAndUser(auctionId: string, userId: string): Promise<AuctionParticipantEntity | null>;
    upsertParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity>;
    revokeParticipant(auctionId: string, userId: string): Promise<AuctionParticipantEntity>;
    listActiveParticipants(auctionId: string): Promise<AuctionParticipantEntity[]>;
    setOnlineStatus(auctionId: string, userId: string, isOnline: boolean, socketId?: string): Promise<void>;
    updateLastSeen(auctionId: string, userId: string): Promise<void>;
    listParticipantsWithStatus(auctionId: string): Promise<AuctionParticipantEntity[]>;
}
