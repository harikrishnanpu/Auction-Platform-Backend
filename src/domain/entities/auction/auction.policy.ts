import { Auction } from "./auction.entity";
import { AuctionError } from "./auction.errors";

export const ensureAuctionActive = (auction: Auction) => {
    if (auction.status !== "ACTIVE") {
        throw new AuctionError("NOT_ALLOWED", "Auction not active");
    }
    if (auction.isPaused) {
        throw new AuctionError("NOT_ALLOWED", "Auction is paused");
    }
};

export const ensureAuctionWindow = (auction: Auction, now: Date) => {
    if (now < auction.startAt) {
        throw new AuctionError("NOT_ALLOWED", "Auction has not started");
    }
    if (now > auction.endAt) {
        throw new AuctionError("AUCTION_ENDED", "Auction has ended");
    }
};

export const ensureBidAmount = (auction: Auction, amount: number) => {
    const minRequired = auction.currentPrice + auction.minBidIncrement;
    if (amount < minRequired) {
        throw new AuctionError("BID_TOO_LOW", `Bid must be at least ${minRequired}`);
    }
};
