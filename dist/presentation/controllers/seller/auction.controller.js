"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerAuctionController = void 0;
const http_status_constants_1 = require("../../../application/constants/http-status.constants");
const response_messages_1 = require("../../../application/constants/response.messages");
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
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const auction = await this.createAuctionUseCase.execute({
                    sellerId,
                    title: req.body.title,
                    description: req.body.description,
                    startAt: req.body.start_at,
                    endAt: req.body.end_at,
                    startPrice: Number(req.body.start_price),
                    minBidIncrement: Number(req.body.min_bid_increment)
                });
                res.status(http_status_constants_1.HttpStatus.CREATED).json({ success: true, data: auction });
            }
            catch (error) {
                console.error("Create Auction Error:", error);
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.getUploadUrl = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
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
                    res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, data: result.getValue() });
                }
                else {
                    res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
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
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const auctions = await this.getSellerAuctionsUseCase.execute(sellerId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, data: auctions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                const auction = await this.getSellerAuctionByIdUseCase.execute(id, sellerId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(http_status_constants_1.HttpStatus.NOT_FOUND).json({ success: false, message: error.message });
            }
        };
        this.publish = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                const auction = await this.publishAuctionUseCase.execute(id, sellerId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.update = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
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
                });
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.pause = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                await this.pauseAuctionUseCase.execute(id, sellerId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.AUCTION_PAUSED_SUCCESS });
            }
            catch (error) {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.resume = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                await this.resumeAuctionUseCase.execute(id, sellerId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.AUCTION_RESUMED_SUCCESS });
            }
            catch (error) {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.end = async (req, res, next) => {
            try {
                const sellerId = req.user?.userId;
                if (!sellerId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const { id } = req.params;
                await this.endAuctionUseCase.execute(id, sellerId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, message: response_messages_1.ResponseMessages.AUCTION_ENDED_SUCCESS });
            }
            catch (error) {
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
    }
}
exports.SellerAuctionController = SellerAuctionController;
