"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
const authorize_middleware_1 = require("../middlewares/authorize.middleware");
const user_entity_1 = require("@domain/entities/user/user.entity");
class AuctionRoutes {
    constructor(_auctionController) {
        this._auctionController = _auctionController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.post('/', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.SELLER, user_entity_1.UserRole.ADMIN]), this._auctionController.create);
        this._router.post('/:id/assets', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.SELLER, user_entity_1.UserRole.ADMIN]), this._auctionController.addAssets);
        this._router.post('/:id/publish', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.SELLER, user_entity_1.UserRole.ADMIN]), this._auctionController.publish);
        this._router.post('/:id/revoke-user', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.SELLER, user_entity_1.UserRole.ADMIN]), this._auctionController.revokeUser);
        this._router.get('/', this._auctionController.list);
        this._router.get('/active', this._auctionController.list);
        this._router.get('/upcoming', this._auctionController.getUpcoming);
        this._router.get('/categories', this._auctionController.getCategories);
        this._router.get('/conditions', this._auctionController.getConditions);
        this._router.get('/:id', this._auctionController.getById);
        this._router.post('/:id/enter', authenticate_middleware_1.authenticate, this._auctionController.enter);
        return this._router;
    }
}
exports.AuctionRoutes = AuctionRoutes;
