"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionControllerFactory = void 0;
const auction_controller_1 = require("../controllers/auction/auction.controller");
class AuctionControllerFactory {
    static create(createAuctionUseCase, addAuctionAssetsUseCase, publishAuctionUseCase, getActiveAuctionsUseCase, getUpcomingAuctionsUseCase, getAuctionByIdUseCase, enterAuctionUseCase, revokeUserUseCase, getAuctionCategoriesUseCase, getAuctionConditionsUseCase) {
        return new auction_controller_1.AuctionController(createAuctionUseCase, addAuctionAssetsUseCase, publishAuctionUseCase, getActiveAuctionsUseCase, getUpcomingAuctionsUseCase, getAuctionByIdUseCase, enterAuctionUseCase, revokeUserUseCase, getAuctionCategoriesUseCase, getAuctionConditionsUseCase);
    }
}
exports.AuctionControllerFactory = AuctionControllerFactory;
