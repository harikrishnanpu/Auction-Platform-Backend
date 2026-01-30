"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUpcomingAuctionsUseCase = void 0;
class GetUpcomingAuctionsUseCase {
    constructor(auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    async execute() {
        const now = new Date();
        // Get all ACTIVE auctions that haven't started yet
        const allAuctions = await this.auctionRepository.findAll();
        return allAuctions.filter(auction => auction.status === 'ACTIVE' &&
            auction.startAt > now);
    }
}
exports.GetUpcomingAuctionsUseCase = GetUpcomingAuctionsUseCase;
