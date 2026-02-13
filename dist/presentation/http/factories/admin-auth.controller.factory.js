"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthControllerFactory = void 0;
const admin_auth_controller_1 = require("../controllers/admin/admin-auth.controller");
class AdminAuthControllerFactory {
    static create(loginAdminUseCase) {
        return new admin_auth_controller_1.AdminAuthController(loginAdminUseCase);
    }
}
exports.AdminAuthControllerFactory = AdminAuthControllerFactory;
