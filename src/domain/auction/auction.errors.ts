export type AuctionErrorCode =
    | "BID_TOO_LOW"
    | "AUCTION_ENDED"
    | "NOT_ALLOWED"
    | "USER_REVOKED"
    | "AUCTION_NOT_FOUND"
    | "RATE_LIMITED"
    | "BID_IN_PROGRESS"
    | "DEADLINE_EXPIRED"
    | "PAYMENT_FAILED"
    | "OFFER_EXPIRED"
    | "INVALID_STATUS"
    | "NOT_FOUND";

export class AuctionError extends Error {
    constructor(
        public readonly code: AuctionErrorCode,
        message: string
    ) {
        super(message);
        this.name = "AuctionError";
    }

    static notFound(): AuctionError {
        return new AuctionError("AUCTION_NOT_FOUND", "Auction not found");
    }

    static bidTooLow(): AuctionError {
        return new AuctionError("BID_TOO_LOW", "Bid amount is too low");
    }

    static auctionEnded(): AuctionError {
        return new AuctionError("AUCTION_ENDED", "Auction has ended");
    }

    static notAllowed(message: string = "Not allowed"): AuctionError {
        return new AuctionError("NOT_ALLOWED", message);
    }

    static userRevoked(): AuctionError {
        return new AuctionError("USER_REVOKED", "User has been revoked");
    }
}
