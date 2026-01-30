import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { IBidRepository } from "../../../domain/auction/repositories/bid.repository";
import { IAuctionParticipantRepository } from "../../../domain/auction/repositories/participant.repository";
import { ITransactionManager } from "../../ports/transaction.port";
import { ensureAuctionActive, ensureAuctionWindow, ensureBidAmount } from "../../../domain/auction/auction.policy";
import { AuctionError } from "../../../domain/auction/auction.errors";

export class PlaceBidUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private participantRepository: IAuctionParticipantRepository,
        private transactionManager: ITransactionManager
    ) { }

    async execute(auctionId: string, userId: string, amount: number) {
        const participant = await this.participantRepository.findByAuctionAndUser(auctionId, userId);
        if (!participant) {
            throw new AuctionError("NOT_ALLOWED", "User not entered in auction");
        }
        if (participant.revokedAt) {
            throw new AuctionError("USER_REVOKED", "User revoked from auction");
        }

        return this.transactionManager.runInTransaction(async (tx) => {
            const auction = await this.auctionRepository.findByIdForUpdate(auctionId, tx);
            if (!auction) {
                throw new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
            }

            ensureAuctionActive(auction);
            ensureAuctionWindow(auction, new Date());

            if (auction.sellerId === userId) {
                throw new AuctionError("NOT_ALLOWED", "Seller cannot bid");
            }

            ensureBidAmount(auction, amount);

            const bid = await this.bidRepository.createBid(auctionId, userId, amount, tx);
            await this.auctionRepository.updateCurrentPrice(auctionId, amount, tx);
            return bid;
        });
    }
}
