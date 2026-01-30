"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAuctionRepository = void 0;
class MockAuctionRepository {
    async create(auction) {
        console.log("Saving auction to DB (Mock):", auction);
        // Simulate DB save
        return auction;
    }
    async findById(auctionId) {
        return null; // Mock
    }
    async findBySellerId(sellerId) {
        return [];
    }
    async findActive() {
        return [];
    }
    async findAll() {
        return [];
    }
    async updateStatus(auctionId, status) {
        throw new Error("Not implemented");
    }
    async update(auctionId, dto) {
        throw new Error("Not implemented");
    }
    async addAssets(auctionId, assets) {
        return;
    }
    async updateCurrentPrice(auctionId, currentPrice, tx) {
        return;
    }
    async findByIdForUpdate(auctionId, tx) {
        return null;
    }
    async extendAuction(auctionId, newEndTime, extensionCount, tx) {
        return;
    }
}
exports.MockAuctionRepository = MockAuctionRepository;
