export class AuctionAsset {
    constructor(
        public readonly id: string,
        public readonly auctionId: string,
        public readonly assetType: 'IMAGE' | 'VIDEO',
        public readonly url: string,
        public readonly position: number,
        public readonly createdAt: Date = new Date()
    ) { }
}

export class Auction {
    constructor(
        public readonly id: string,
        public readonly sellerId: string,
        public readonly title: string,
        public readonly description: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
        public readonly startPrice: number,
        public readonly minBidIncrement: number,
        public readonly currentPrice: number,
        public readonly assets: AuctionAsset[],
        public readonly status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED' = 'DRAFT',
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) { }
}
