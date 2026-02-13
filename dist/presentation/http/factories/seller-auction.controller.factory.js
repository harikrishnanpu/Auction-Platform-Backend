"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerAuctionControllerFactory = void 0;
const auction_controller_1 = require("../controllers/seller/auction.controller");
class SellerAuctionControllerFactory {
    static create(createAuctionUseCase, generateUploadUrlUseCase, getSellerAuctionsUseCase, publishAuctionUseCase, getSellerAuctionByIdUseCase, updateAuctionUseCase, pauseAuctionUseCase, resumeAuctionUseCase, endAuctionUseCase) {
        return new auction_controller_1.SellerAuctionController(createAuctionUseCase, generateUploadUrlUseCase, getSellerAuctionsUseCase, publishAuctionUseCase, getSellerAuctionByIdUseCase, updateAuctionUseCase, pauseAuctionUseCase, resumeAuctionUseCase, endAuctionUseCase);
    }
}
exports.SellerAuctionControllerFactory = SellerAuctionControllerFactory;
