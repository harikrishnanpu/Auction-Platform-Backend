"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuctionAssetsUseCase = void 0;
const auction_entity_1 = require("@domain/entities/auction/auction.entity");
const uuid_1 = require("uuid");
const result_1 = require("@result/result");
class AddAuctionAssetsUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(auctionId, sellerId, assets) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return result_1.Result.fail("Auction not found");
            }
            const domainAssets = assets.map((asset) => new auction_entity_1.AuctionAsset((0, uuid_1.v4)(), auctionId, asset.assetType || asset.asset_type, asset.url, asset.position != null ? Number(asset.position) : 0));
            await this.auctionRepository.addAssets(auctionId, domainAssets);
            return result_1.Result.ok(undefined);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.AddAuctionAssetsUseCase = AddAuctionAssetsUseCase;
