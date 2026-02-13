export interface ChatMessageEntity {
    id: string;
    auctionId: string;
    userId: string;
    message: string;
    createdAt: Date;
    username?: string;
    userAvatar?: string | null;
}

export interface IChatMessageRepository {
    createMessage(auctionId: string, userId: string, message: string): Promise<ChatMessageEntity>;
    findLatestByAuction(auctionId: string, limit: number): Promise<ChatMessageEntity[]>;
}
