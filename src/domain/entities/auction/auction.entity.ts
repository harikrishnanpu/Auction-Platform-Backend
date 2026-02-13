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
        public readonly categoryId: string | null,
        public readonly conditionId: string | null,
        public readonly title: string,
        public readonly description: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
        public readonly startPrice: number,
        public readonly minBidIncrement: number,
        public readonly currentPrice: number,
        public readonly assets: AuctionAsset[],
        public readonly status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED' = 'DRAFT',
        public readonly isPaused: boolean = false,
        public readonly winnerId: string | null = null,
        public readonly winnerPaymentDeadline: Date | null = null,
        public readonly completionStatus: string = 'PENDING',
        public readonly extensionCount: number = 0,
        public readonly antiSnipeThresholdSeconds: number = 30,
        public readonly antiSnipeExtensionSeconds: number = 30,
        public readonly maxExtensions: number = 5,
        public readonly bidCooldownSeconds: number = 60,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) { }
}
