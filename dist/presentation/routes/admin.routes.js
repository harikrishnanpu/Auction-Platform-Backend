"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
const authorize_middleware_1 = require("../middlewares/authorize.middleware");
class AdminRoutes {
    constructor(adminController, adminAuthController) {
        this.adminController = adminController;
        this.adminAuthController = adminAuthController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.post('/login', this.adminAuthController.login.bind(this.adminAuthController));
        this._router.get('/users', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)(['ADMIN']), this.adminController.getUsers.bind(this.adminController));
        this._router.get('/users/:id', authenticate_middleware_1.authenticate, (0, authorize_middleware_1.authorize)(['ADMIN']), this.adminController.getUserById.bind(this.adminController));
        return this._router;
    }
}
exports.AdminRoutes = AdminRoutes;
