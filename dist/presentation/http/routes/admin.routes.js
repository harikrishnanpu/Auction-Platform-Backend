"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
const authorize_middleware_1 = require("../middlewares/authorize.middleware");
const user_entity_1 = require("@domain/entities/user/user.entity");
class AdminRoutes {
    constructor(_adminAuthController, _adminController) {
        this._adminAuthController = _adminAuthController;
        this._adminController = _adminController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.post('/auth/login', this._adminAuthController.login);
        this._router.get('/stats', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.getStats);
        this._router.get('/users', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.getUsers);
        this._router.get('/users/:id', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.getUserById);
        this._router.put('/users/:id', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.updateUser);
        this._router.post('/users/:id/block', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.blockUser);
        this._router.delete('/users/:id', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.deleteUser);
        this._router.get('/sellers', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.getSellers);
        this._router.get('/sellers/:id', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.getSellerById);
        this._router.post('/sellers/:id/verify', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.verifySellerKyc);
        this._router.post('/sellers/:id/assign-role', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)([user_entity_1.UserRole.ADMIN]), this._adminController.assignSellerRole);
        return this._router;
    }
}
exports.AdminRoutes = AdminRoutes;
