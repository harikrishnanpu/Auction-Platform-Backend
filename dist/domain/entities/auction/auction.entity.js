"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auction = exports.AuctionAsset = void 0;
class AuctionAsset {
    constructor(id, auctionId, assetType, url, position, createdAt = new Date()) {
        this.id = id;
        this.auctionId = auctionId;
        this.assetType = assetType;
        this.url = url;
        this.position = position;
        this.createdAt = createdAt;
    }
}
exports.AuctionAsset = AuctionAsset;
class Auction {
    constructor(id, sellerId, categoryId, conditionId, title, description, startAt, endAt, startPrice, minBidIncrement, currentPrice, assets, status = 'DRAFT', isPaused = false, winnerId = null, winnerPaymentDeadline = null, completionStatus = 'PENDING', extensionCount = 0, antiSnipeThresholdSeconds = 30, antiSnipeExtensionSeconds = 30, maxExtensions = 5, bidCooldownSeconds = 60, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.sellerId = sellerId;
        this.categoryId = categoryId;
        this.conditionId = conditionId;
        this.title = title;
        this.description = description;
        this.startAt = startAt;
        this.endAt = endAt;
        this.startPrice = startPrice;
        this.minBidIncrement = minBidIncrement;
        this.currentPrice = currentPrice;
        this.assets = assets;
        this.status = status;
        this.isPaused = isPaused;
        this.winnerId = winnerId;
        this.winnerPaymentDeadline = winnerPaymentDeadline;
        this.completionStatus = completionStatus;
        this.extensionCount = extensionCount;
        this.antiSnipeThresholdSeconds = antiSnipeThresholdSeconds;
        this.antiSnipeExtensionSeconds = antiSnipeExtensionSeconds;
        this.maxExtensions = maxExtensions;
        this.bidCooldownSeconds = bidCooldownSeconds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Auction = Auction;
