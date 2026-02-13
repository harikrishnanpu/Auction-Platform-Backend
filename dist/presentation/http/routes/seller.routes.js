"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
const authorize_middleware_1 = require("../middlewares/authorize.middleware");
const user_entity_1 = require("@domain/entities/user/user.entity");
class SellerRoutes {
    constructor(_sellerAuctionController) {
        this._sellerAuctionController = _sellerAuctionController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.use(authenticate_middleware_1.authenticate);
        this._router.use((0, authorize_middleware_1.authorize)([user_entity_1.UserRole.SELLER, user_entity_1.UserRole.ADMIN]));
        this._router.post('/auction', this._sellerAuctionController.create);
        this._router.post('/auction/upload-url', this._sellerAuctionController.getUploadUrl);
        this._router.get('/auctions', this._sellerAuctionController.getMyAuctions);
        this._router.get('/auctions/:id', this._sellerAuctionController.getById);
        this._router.patch('/auctions/:id', this._sellerAuctionController.update);
        this._router.post('/auction/:id/publish', this._sellerAuctionController.publish);
        this._router.post('/auctions/:id/pause', this._sellerAuctionController.pause);
        this._router.post('/auctions/:id/resume', this._sellerAuctionController.resume);
        this._router.post('/auctions/:id/end', this._sellerAuctionController.end);
        return this._router;
    }
}
exports.SellerRoutes = SellerRoutes;
