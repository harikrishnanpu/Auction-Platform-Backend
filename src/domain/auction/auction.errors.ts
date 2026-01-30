export type AuctionErrorCode =
    | "BID_TOO_LOW"
    | "AUCTION_ENDED"
    | "NOT_ALLOWED"
    | "USER_REVOKED"
    | "AUCTION_NOT_FOUND";

export class AuctionError extends Error {
    constructor(
        public readonly code: AuctionErrorCode,
        message: string
    ) {
        super(message);
        this.name = "AuctionError";
    }
}
