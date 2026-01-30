import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IChatMessageRepository } from "../../../domain/auction/repositories/chat-message.repository";

export interface AuctionRoomState {
    auctionId: string;
    latestBids: Awaited<ReturnType<IBidRepository["findLatestByAuction"]>>;
    latestMessages: Awaited<ReturnType<IChatMessageRepository["findLatestByAuction"]>>;
}

export class GetAuctionRoomStateUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private chatMessageRepository: IChatMessageRepository
    ) { }

    async execute(auctionId: string, limit = 20): Promise<AuctionRoomState> {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction) {
            throw new Error("Auction not found");
        }

        const [latestBids, latestMessages] = await Promise.all([
            this.bidRepository.findLatestByAuction(auctionId, limit),
            this.chatMessageRepository.findLatestByAuction(auctionId, limit)
        ]);

        return {
            auctionId,
            latestBids,
            latestMessages
        };
    }
}
