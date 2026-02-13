"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminControllerFactory = void 0;
const admin_controller_1 = require("../controllers/admin/admin.controller");
class AdminControllerFactory {
    static create(getUsersUseCase, getUserByIdUseCase, updateUserUseCase, blockUserUseCase, deleteUserUseCase, getSellersUseCase, getSellerByIdUseCase, verifySellerKycUseCase, assignSellerRoleUseCase, getAdminStatsUseCase) {
        return new admin_controller_1.AdminController(getUsersUseCase, getUserByIdUseCase, updateUserUseCase, blockUserUseCase, deleteUserUseCase, getSellersUseCase, getSellerByIdUseCase, verifySellerKycUseCase, assignSellerRoleUseCase, getAdminStatsUseCase);
    }
}
exports.AdminControllerFactory = AdminControllerFactory;
