"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBidAmount = exports.ensureAuctionWindow = exports.ensureAuctionActive = void 0;
const auction_errors_1 = require("./auction.errors");
const auction_messages_1 = require("../../application/constants/auction.messages");
const ensureAuctionActive = (auction) => {
    if (auction.status !== "ACTIVE") {
        throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, "Auction not active");
    }
};
exports.ensureAuctionActive = ensureAuctionActive;
const ensureAuctionWindow = (auction, now) => {
    if (now < auction.startAt) {
        throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.NOT_ALLOWED, "Auction has not started");
    }
    if (now > auction.endAt) {
        throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.AUCTION_ENDED, auction_messages_1.AuctionMessages.AUCTION_ENDED);
    }
};
exports.ensureAuctionWindow = ensureAuctionWindow;
const ensureBidAmount = (auction, amount) => {
    const minRequired = auction.currentPrice + auction.minBidIncrement;
    if (amount < minRequired) {
        throw new auction_errors_1.AuctionError(auction_errors_1.AuctionErrorCode.BID_TOO_LOW, `Bid must be at least ${minRequired}`);
    }
};
exports.ensureBidAmount = ensureBidAmount;
