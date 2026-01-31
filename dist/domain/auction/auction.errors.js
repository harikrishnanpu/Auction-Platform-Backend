"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionError = exports.AuctionErrorCode = void 0;
const auction_messages_1 = require("../../application/constants/auction.messages");
const auction_status_codes_1 = require("../../application/constants/auction.status-codes");
Object.defineProperty(exports, "AuctionErrorCode", { enumerable: true, get: function () { return auction_status_codes_1.AuctionErrorCode; } });
class AuctionError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "AuctionError";
    }
    static notFound() {
        return new AuctionError(auction_status_codes_1.AuctionErrorCode.AUCTION_NOT_FOUND, auction_messages_1.AuctionMessages.AUCTION_NOT_FOUND);
    }
    static bidTooLow() {
        return new AuctionError(auction_status_codes_1.AuctionErrorCode.BID_TOO_LOW, auction_messages_1.AuctionMessages.BID_TOO_LOW);
    }
    static auctionEnded() {
        return new AuctionError(auction_status_codes_1.AuctionErrorCode.AUCTION_ENDED, auction_messages_1.AuctionMessages.AUCTION_ENDED);
    }
    static notAllowed(message = auction_messages_1.AuctionMessages.NOT_ALLOWED) {
        return new AuctionError(auction_status_codes_1.AuctionErrorCode.NOT_ALLOWED, message);
    }
    static userRevoked() {
        return new AuctionError(auction_status_codes_1.AuctionErrorCode.USER_REVOKED, auction_messages_1.AuctionMessages.USER_REVOKED);
    }
}
exports.AuctionError = AuctionError;
