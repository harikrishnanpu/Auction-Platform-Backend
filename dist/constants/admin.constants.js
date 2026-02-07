"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_CONSTANTS = exports.ADMIN_MESSAGES = void 0;
const status_code_1 = require("./status.code");
exports.ADMIN_MESSAGES = {
    USERS_FETCHED: "Users fetched successfully",
    USER_FETCHED: "User fetched successfully",
    USER_UPDATED: "User updated successfully",
    USER_BLOCKED: "User blocked successfully",
    USER_UNBLOCKED: "User unblocked successfully",
    USER_DELETED: "User deleted successfully",
    SELLERS_FETCHED: "Sellers fetched successfully",
    SELLER_FETCHED: "Seller fetched successfully",
    SELLER_KYC_VERIFIED: "Seller KYC verified successfully",
    SELLER_KYC_REJECTED: "Seller KYC verification rejected",
    SELLER_ROLE_ASSIGNED: "Seller role assigned successfully",
    ADMIN_STATS_FETCHED: "Admin stats fetched successfully"
};
exports.ADMIN_CONSTANTS = {
    MESSAGES: exports.ADMIN_MESSAGES,
    CODES: status_code_1.STATUS_CODE,
};
