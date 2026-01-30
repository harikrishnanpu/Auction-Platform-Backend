export class AuctionMedia {
    constructor(
        public readonly id: string,
        public readonly auctionId: string,
        public readonly sellerId: string,
        public readonly type: 'IMAGE' | 'VIDEO',
        public readonly url: string, // This will be the S3 Key
        public readonly isPrimary: boolean
    ) { }
}

export class Auction {
    constructor(
        public readonly auctionId: string,
        public readonly sellerId: string,
        public readonly title: string,
        public readonly description: string,
        public readonly category: string,
        public readonly condition: string,
        public readonly startPrice: number,
        public readonly minIncrement: number,
        public readonly startTime: Date,
        public readonly endTime: Date,
        public readonly media: AuctionMedia[],
        public readonly status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD' | 'CANCELLED' = 'DRAFT',
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) { }
}
