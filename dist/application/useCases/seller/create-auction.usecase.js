"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuctionUseCase = void 0;
const auction_entity_1 = require("../../../domain/auction/auction.entity");
const uuid_1 = require("uuid");
class CreateAuctionUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute(dto) {
        const start = new Date(dto.startAt);
        const end = new Date(dto.endAt);
        if (end <= start) {
            throw new Error("End time must be after start time");
        }
        const auctionId = (0, uuid_1.v4)();
        const auction = new auction_entity_1.Auction(auctionId, dto.sellerId, dto.categoryId || null, dto.conditionId || null, dto.title, dto.description, start, end, dto.startPrice, dto.minBidIncrement, dto.startPrice, [], 'DRAFT', false);
        return await this.auctionRepository.create(auction);
    }
}
exports.CreateAuctionUseCase = CreateAuctionUseCase;
