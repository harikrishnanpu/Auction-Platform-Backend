"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const status_code_1 = require("constants/status.code");
const app_error_1 = require("shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class AuctionController {
    constructor(createAuctionUseCase, addAuctionAssetsUseCase, publishAuctionUseCase, getActiveAuctionsUseCase, getUpcomingAuctionsUseCase, getAuctionByIdUseCase, enterAuctionUseCase, revokeUserUseCase, getAuctionCategoriesUseCase, getAuctionConditionsUseCase) {
        this.createAuctionUseCase = createAuctionUseCase;
        this.addAuctionAssetsUseCase = addAuctionAssetsUseCase;
        this.publishAuctionUseCase = publishAuctionUseCase;
        this.getActiveAuctionsUseCase = getActiveAuctionsUseCase;
        this.getUpcomingAuctionsUseCase = getUpcomingAuctionsUseCase;
        this.getAuctionByIdUseCase = getAuctionByIdUseCase;
        this.enterAuctionUseCase = enterAuctionUseCase;
        this.revokeUserUseCase = revokeUserUseCase;
        this.getAuctionCategoriesUseCase = getAuctionCategoriesUseCase;
        this.getAuctionConditionsUseCase = getAuctionConditionsUseCase;
        this.create = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                throw new app_error_1.AppError("Unauthorized", status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.createAuctionUseCase.execute(userId, req.body);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            const auction = result.getValue();
            res.status(status_code_1.STATUS_CODE.CREATED).json({ success: true, data: { ...auction, auctionId: auction.id } });
        });
        this.addAssets = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            const sellerId = req.user?.userId;
            const assets = Array.isArray(req.body.assets) ? req.body.assets : [];
            const result = await this.addAuctionAssetsUseCase.execute(id, sellerId, assets);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.publish = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            const { id } = req.params;
            const result = await this.publishAuctionUseCase.execute(userId, id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Auction published successfully" });
        });
        this.list = (0, express_async_handler_1.default)(async (req, res) => {
            const result = await this.getActiveAuctionsUseCase.execute(req.query);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.getById = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            const result = await this.getAuctionByIdUseCase.execute(id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.enter = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?.userId;
            const { id } = req.params;
            if (!userId)
                throw new app_error_1.AppError("Unauthorized", status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.enterAuctionUseCase.execute(id, userId);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.revokeUser = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            const actorId = req.user?.userId;
            const { userId } = req.body;
            const result = await this.revokeUserUseCase.execute(id, actorId, userId);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "User revoked successfully" });
        });
        this.getUpcoming = (0, express_async_handler_1.default)(async (req, res) => {
            const result = await this.getUpcomingAuctionsUseCase.execute(req.query);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.getCategories = (0, express_async_handler_1.default)(async (req, res) => {
            const result = await this.getAuctionCategoriesUseCase.execute();
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.getConditions = (0, express_async_handler_1.default)(async (req, res) => {
            const result = await this.getAuctionConditionsUseCase.execute();
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
    }
}
exports.AuctionController = AuctionController;
