"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const http_status_constants_1 = require("../../application/constants/http-status.constants");
const response_messages_1 = require("../../application/constants/response.messages");
class AdminController {
    constructor(getUsersUseCase, getUserByIdUseCase, updateUserUseCase, blockUserUseCase, deleteUserUseCase, getSellersUseCase, getSellerByIdUseCase, verifySellerKycUseCase, assignSellerRoleUseCase, getAdminStatsUseCase, getAdminAuctionsUseCase, getAdminAuctionByIdUseCase) {
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
        this.getAdminAuctionsUseCase = getAdminAuctionsUseCase;
        this.getAdminAuctionByIdUseCase = getAdminAuctionByIdUseCase;
        this.getStats = async (req, res) => {
            const result = await this.getAdminStatsUseCase.execute();
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.getAuctions = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
            const sellerId = req.query.sellerId;
            const categoryId = req.query.categoryId;
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const result = await this.getAdminAuctionsUseCase.execute(page, limit, { search, status, sellerId, categoryId }, { field: sortBy, order: sortOrder });
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.getAuctionById = async (req, res) => {
            const id = req.params.id;
            const result = await this.getAdminAuctionByIdUseCase.execute(id);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.NOT_FOUND).json({ message: result.error });
            }
        };
        this.getUsers = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const result = await this.getUsersUseCase.execute(page, limit, search, sortBy, sortOrder);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.getUserById = async (req, res) => {
            const id = req.params.id;
            const result = await this.getUserByIdUseCase.execute(id);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.NOT_FOUND).json({ message: result.error });
            }
        };
        this.updateUser = async (req, res) => {
            const id = req.params.id;
            const dto = req.body;
            const result = await this.updateUserUseCase.execute(id, dto);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json({ message: response_messages_1.ResponseMessages.USER_UPDATED_SUCCESS });
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.blockUser = async (req, res) => {
            const id = req.params.id;
            const block = req.body.block === true;
            const result = await this.blockUserUseCase.execute(id, block);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json({ message: block ? response_messages_1.ResponseMessages.USER_BLOCKED_SUCCESS : response_messages_1.ResponseMessages.USER_UNBLOCKED_SUCCESS });
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.deleteUser = async (req, res) => {
            const id = req.params.id;
            const result = await this.deleteUserUseCase.execute(id);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json({ message: response_messages_1.ResponseMessages.USER_DELETED_SUCCESS });
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.getSellers = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.getSellersUseCase.execute(page, limit);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.getSellerById = async (req, res) => {
            const id = req.params.id;
            const result = await this.getSellerByIdUseCase.execute(id);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json(result.getValue());
            }
            else {
                res.status(http_status_constants_1.HttpStatus.NOT_FOUND).json({ message: result.error });
            }
        };
        this.verifySellerKyc = async (req, res) => {
            const id = req.params.id;
            const verify = req.body.verify === true;
            const result = await this.verifySellerKycUseCase.execute(id, verify);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json({ message: verify ? response_messages_1.ResponseMessages.SELLER_KYC_VERIFIED : response_messages_1.ResponseMessages.SELLER_KYC_REJECTED });
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
        this.assignSellerRole = async (req, res) => {
            const id = req.params.id;
            const result = await this.assignSellerRoleUseCase.execute(id);
            if (result.isSuccess) {
                res.status(http_status_constants_1.HttpStatus.OK).json({ message: response_messages_1.ResponseMessages.SELLER_ROLE_ASSIGNED });
            }
            else {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ message: result.error });
            }
        };
    }
}
exports.AdminController = AdminController;
