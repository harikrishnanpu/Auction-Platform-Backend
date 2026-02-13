"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerAuctionController = void 0;
const status_code_1 = require("constants/status.code");
const seller_constants_1 = require("constants/seller.constants");
const app_error_1 = require("shared/app.error");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class SellerAuctionController {
    constructor(createAuctionUseCase, generateUploadUrlUseCase, getSellerAuctionsUseCase, publishAuctionUseCase, getSellerAuctionByIdUseCase, updateAuctionUseCase, pauseAuctionUseCase, resumeAuctionUseCase, endAuctionUseCase) {
        this.createAuctionUseCase = createAuctionUseCase;
        this.generateUploadUrlUseCase = generateUploadUrlUseCase;
        this.getSellerAuctionsUseCase = getSellerAuctionsUseCase;
        this.publishAuctionUseCase = publishAuctionUseCase;
        this.getSellerAuctionByIdUseCase = getSellerAuctionByIdUseCase;
        this.updateAuctionUseCase = updateAuctionUseCase;
        this.pauseAuctionUseCase = pauseAuctionUseCase;
        this.resumeAuctionUseCase = resumeAuctionUseCase;
        this.endAuctionUseCase = endAuctionUseCase;
        this.create = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.createAuctionUseCase.execute(sellerId, {
                title: req.body.title,
                description: req.body.description,
                startAt: req.body.start_at,
                endAt: req.body.end_at,
                startPrice: Number(req.body.start_price),
                minBidIncrement: Number(req.body.min_bid_increment),
                categoryId: req.body.category_id ?? undefined,
                conditionId: req.body.condition_id ?? undefined,
                antiSnipeThresholdSeconds: req.body.anti_snipe_threshold_seconds != null ? Number(req.body.anti_snipe_threshold_seconds) : undefined,
                antiSnipeExtensionSeconds: req.body.anti_snipe_extension_seconds != null ? Number(req.body.anti_snipe_extension_seconds) : undefined,
                maxExtensions: req.body.max_extensions != null ? Number(req.body.max_extensions) : undefined,
                bidCooldownSeconds: req.body.bid_cooldown_seconds != null ? Number(req.body.bid_cooldown_seconds) : undefined
            });
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            const auction = result.getValue();
            res.status(status_code_1.STATUS_CODE.CREATED).json({ success: true, data: { ...auction, auctionId: auction.id } });
        });
        this.getUploadUrl = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { fileName, contentType } = req.body;
            const result = await this.generateUploadUrlUseCase.execute(sellerId, fileName, contentType);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.getMyAuctions = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const result = await this.getSellerAuctionsUseCase.execute(sellerId, req.query);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.getById = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { id } = req.params;
            const result = await this.getSellerAuctionByIdUseCase.execute(sellerId, id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.NOT_FOUND);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.publish = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { id } = req.params;
            const result = await this.publishAuctionUseCase.execute(sellerId, id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: "Auction published successfully" });
        });
        this.update = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { id } = req.params;
            const result = await this.updateAuctionUseCase.execute(sellerId, id, req.body);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
        });
        this.pause = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { id } = req.params;
            const result = await this.pauseAuctionUseCase.execute(sellerId, id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: seller_constants_1.SELLER_MESSAGES.AUCTION_PAUSED });
        });
        this.resume = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { id } = req.params;
            const result = await this.resumeAuctionUseCase.execute(sellerId, id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: seller_constants_1.SELLER_MESSAGES.AUCTION_RESUMED });
        });
        this.end = (0, express_async_handler_1.default)(async (req, res) => {
            const sellerId = req.user?.userId;
            if (!sellerId)
                throw new app_error_1.AppError(seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED, status_code_1.STATUS_CODE.UNAUTHORIZED);
            const { id } = req.params;
            const result = await this.endAuctionUseCase.execute(sellerId, id);
            if (result.isFailure)
                throw new app_error_1.AppError(result.error, status_code_1.STATUS_CODE.BAD_REQUEST);
            res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: seller_constants_1.SELLER_MESSAGES.AUCTION_ENDED });
        });
    }
}
exports.SellerAuctionController = SellerAuctionController;
