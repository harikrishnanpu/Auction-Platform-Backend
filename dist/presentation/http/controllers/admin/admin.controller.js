"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_constants_1 = require("constants/admin.constants");
const status_code_1 = require("constants/status.code");
const app_error_1 = require("shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class AdminController {
    constructor(getUsersUseCase, getUserByIdUseCase, updateUserUseCase, blockUserUseCase, deleteUserUseCase, getSellersUseCase, getSellerByIdUseCase, verifySellerKycUseCase, assignSellerRoleUseCase, getAdminStatsUseCase) {
        this.getUsersUseCase = getUsersUseCase;
        this.getUserByIdUseCase = getUserByIdUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.blockUserUseCase = blockUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.getSellersUseCase = getSellersUseCase;
        this.getSellerByIdUseCase = getSellerByIdUseCase;
        this.verifySellerKycUseCase = verifySellerKycUseCase;
        this.assignSellerRoleUseCase = assignSellerRoleUseCase;
        this.getAdminStatsUseCase = getAdminStatsUseCase;
        this.getStats = (0, express_async_handler_1.default)(async (req, res) => {
            const result = await this.getAdminStatsUseCase.execute();
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: admin_constants_1.ADMIN_MESSAGES.ADMIN_STATS_FETCHED,
                data: result.getValue()
            });
        });
        this.getUsers = (0, express_async_handler_1.default)(async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const result = await this.getUsersUseCase.execute({ page, limit, search, sortBy, sortOrder });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: admin_constants_1.ADMIN_MESSAGES.USERS_FETCHED,
                data: result.getValue()
            });
        });
        this.getUserById = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const result = await this.getUserByIdUseCase.execute(id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: admin_constants_1.ADMIN_MESSAGES.USER_FETCHED,
                data: result.getValue()
            });
        });
        this.updateUser = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const dto = req.body;
            const result = await this.updateUserUseCase.execute(id, dto);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: admin_constants_1.ADMIN_MESSAGES.USER_UPDATED });
        });
        this.blockUser = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const block = req.body.block === true;
            const result = await this.blockUserUseCase.execute(id, block);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: block ? admin_constants_1.ADMIN_MESSAGES.USER_BLOCKED : admin_constants_1.ADMIN_MESSAGES.USER_UNBLOCKED
            });
        });
        this.deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const result = await this.deleteUserUseCase.execute(id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: admin_constants_1.ADMIN_MESSAGES.USER_DELETED });
        });
        this.getSellers = (0, express_async_handler_1.default)(async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const kycStatus = req.query.kycStatus;
            const result = await this.getSellersUseCase.execute({ page, limit, search, sortBy, sortOrder, kycStatus });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: admin_constants_1.ADMIN_MESSAGES.SELLERS_FETCHED,
                data: result.getValue()
            });
        });
        this.getSellerById = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const result = await this.getSellerByIdUseCase.execute(id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: admin_constants_1.ADMIN_MESSAGES.SELLER_FETCHED,
                data: result.getValue()
            });
        });
        this.verifySellerKyc = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const verify = req.body.verify === true;
            const reasonMessage = req.body.reasonMessage;
            const result = await this.verifySellerKycUseCase.execute(id, verify, undefined, reasonMessage);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({
                success: true,
                message: verify ? admin_constants_1.ADMIN_MESSAGES.SELLER_KYC_VERIFIED : admin_constants_1.ADMIN_MESSAGES.SELLER_KYC_REJECTED
            });
        });
        this.assignSellerRole = (0, express_async_handler_1.default)(async (req, res) => {
            const id = req.params.id;
            const result = await this.assignSellerRoleUseCase.execute(id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: admin_constants_1.ADMIN_MESSAGES.SELLER_ROLE_ASSIGNED });
        });
    }
}
exports.AdminController = AdminController;
