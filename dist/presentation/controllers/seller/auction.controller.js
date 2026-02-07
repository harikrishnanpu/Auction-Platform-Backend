"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerAuctionController = void 0;
const status_code_1 = require("../../../constants/status.code");
const seller_constants_1 = require("../../../constants/seller.constants");
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
        this.create = async (req, res, next) => {
            try {
                // Basic Auth Check (Robustness)
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const auction = await this.createAuctionUseCase.execute({
                    sellerId,
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
                res.status(status_code_1.STATUS_CODE.CREATED).json({ success: true, data: { ...auction, auctionId: auction.id } });
            }
            catch (error) {
                console.error("Create Auction Error:", error);
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.getUploadUrl = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { fileName, contentType, mediaType } = req.body;
                const result = await this.generateUploadUrlUseCase.execute({
                    sellerId,
                    fileName,
                    contentType,
                    mediaType: mediaType
                });
                if (result.isSuccess) {
                    res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
                }
                else {
                    res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getMyAuctions = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const auctions = await this.getSellerAuctionsUseCase.execute(sellerId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auctions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                const auction = await this.getSellerAuctionByIdUseCase.execute(id, sellerId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.NOT_FOUND).json({ success: false, message: error.message });
            }
        };
        this.publish = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                const auction = await this.publishAuctionUseCase.execute(id, sellerId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.update = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                const body = req.body;
                const auction = await this.updateAuctionUseCase.execute(id, sellerId, {
                    title: body.title,
                    description: body.description,
                    startAt: body.start_at ? new Date(body.start_at) : undefined,
                    endAt: body.end_at ? new Date(body.end_at) : undefined,
                    startPrice: body.start_price != null ? Number(body.start_price) : undefined,
                    minBidIncrement: body.min_bid_increment != null ? Number(body.min_bid_increment) : undefined,
                    antiSnipeThresholdSeconds: body.anti_snipe_threshold_seconds != null ? Number(body.anti_snipe_threshold_seconds) : undefined,
                    antiSnipeExtensionSeconds: body.anti_snipe_extension_seconds != null ? Number(body.anti_snipe_extension_seconds) : undefined,
                    maxExtensions: body.max_extensions != null ? Number(body.max_extensions) : undefined,
                    bidCooldownSeconds: body.bid_cooldown_seconds != null ? Number(body.bid_cooldown_seconds) : undefined
                });
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.pause = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                await this.pauseAuctionUseCase.execute(id, sellerId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: seller_constants_1.SELLER_MESSAGES.AUCTION_PAUSED });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.resume = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                await this.resumeAuctionUseCase.execute(id, sellerId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: seller_constants_1.SELLER_MESSAGES.AUCTION_RESUMED });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.end = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(status_code_1.STATUS_CODE.UNAUTHORIZED).json({ message: seller_constants_1.SELLER_MESSAGES.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                await this.endAuctionUseCase.execute(id, sellerId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, message: seller_constants_1.SELLER_MESSAGES.AUCTION_ENDED });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
    }
}
exports.SellerAuctionController = SellerAuctionController;
