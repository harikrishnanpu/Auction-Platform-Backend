"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuctionAssetsUseCase = void 0;
const auction_entity_1 = require("../../../domain/auction/auction.entity");
const uuid_1 = require("uuid");
class AddAuctionAssetsUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(dto) {
        const auction = await this.auctionRepository.findById(dto.auctionId);
        if (!auction || auction.sellerId !== dto.sellerId) {
            throw new Error("Auction not found");
        }
        const assets = dto.assets.map((asset) => new auction_entity_1.AuctionAsset((0, uuid_1.v4)(), dto.auctionId, asset.assetType, asset.url, asset.position));
        await this.auctionRepository.addAssets(dto.auctionId, assets);
        return { success: true };
    }
}
exports.AddAuctionAssetsUseCase = AddAuctionAssetsUseCase;
