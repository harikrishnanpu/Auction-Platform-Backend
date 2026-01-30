export interface ChatMessageEntity {
    id: string;
    auctionId: string;
    userId: string;
    message: string;
    createdAt: Date;
}

export interface IChatMessageRepository {
    createMessage(auctionId: string, userId: string, message: string): Promise<ChatMessageEntity>;
    findLatestByAuction(auctionId: string, limit: number): Promise<ChatMessageEntity[]>;
}
