import { Auction } from "./auction.entity";
import { AuctionError, AuctionErrorCode } from "./auction.errors";
import { AuctionMessages } from "../../application/constants/auction.messages";

export const ensureAuctionActive = (auction: Auction) => {
    if (auction.status !== "ACTIVE") {
        throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, "Auction not active");
    }
};

export const ensureAuctionWindow = (auction: Auction, now: Date) => {
    if (now < auction.startAt) {
        throw new AuctionError(AuctionErrorCode.NOT_ALLOWED, "Auction has not started");
    }
    if (now > auction.endAt) {
        throw new AuctionError(AuctionErrorCode.AUCTION_ENDED, AuctionMessages.AUCTION_ENDED);
    }
};

export const ensureBidAmount = (auction: Auction, amount: number) => {
    const minRequired = auction.currentPrice + auction.minBidIncrement;
    if (amount < minRequired) {
        throw new AuctionError(AuctionErrorCode.BID_TOO_LOW, `Bid must be at least ${minRequired}`);
    }
};

