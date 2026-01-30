"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionError = void 0;
class AuctionError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "AuctionError";
    }
    static notFound() {
        return new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
    }
    static bidTooLow() {
        return new AuctionError("BID_TOO_LOW", "Bid amount is too low");
    }
    static auctionEnded() {
        return new AuctionError("AUCTION_ENDED", "Auction has ended");
    }
    static notAllowed(message = "Not allowed") {
        return new AuctionError("NOT_ALLOWED", message);
    }
    static userRevoked() {
        return new AuctionError("USER_REVOKED", "User has been revoked");
    }
}
exports.AuctionError = AuctionError;
