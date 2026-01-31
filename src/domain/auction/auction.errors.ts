import { AuctionMessages } from "../../application/constants/auction.messages";
import { AuctionErrorCode } from "../../application/constants/auction.status-codes";

export { AuctionErrorCode };

export class AuctionError extends Error {
    constructor(
        public readonly code: AuctionErrorCode,
        message: string
    ) {
        super(message);
        this.name = "AuctionError";
    }

    static notFound(): AuctionError {
        return new AuctionError(AuctionErrorCode.AUCTION_NOT_FOUND, AuctionMessages.AUCTION_NOT_FOUND);
    }

    static bidTooLow(): AuctionError {
        return new AuctionError(AuctionErrorCode.BID_TOO_LOW, AuctionMessages.BID_TOO_LOW);
    }

    static auctionEnded(): AuctionError {
        return new AuctionError(AuctionErrorCode.AUCTION_ENDED, AuctionMessages.AUCTION_ENDED);
    }

    static notAllowed(message: string = AuctionMessages.NOT_ALLOWED): AuctionError {
        return new AuctionError(AuctionErrorCode.NOT_ALLOWED, message);
    }

    static userRevoked(): AuctionError {
        return new AuctionError(AuctionErrorCode.USER_REVOKED, AuctionMessages.USER_REVOKED);
    }
}

