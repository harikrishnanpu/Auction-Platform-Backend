"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const status_code_1 = require("../../../constants/status.code");
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
        this.create = async (req, res, next) => {
            try {
                const user = req.user;
                const auction = await this.createAuctionUseCase.execute({
                    sellerId: user.userId,
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
                next(error);
            }
        };
        this.addAssets = async (req, res, next) => {
            try {
                const user = req.user;
                const { id } = req.params;
                const assets = Array.isArray(req.body.assets) ? req.body.assets : [];
                const result = await this.addAuctionAssetsUseCase.execute({
                    auctionId: id,
                    sellerId: user.userId,
                    assets: assets.map((asset) => ({
                        assetType: asset.asset_type,
                        url: asset.url,
                        position: Number(asset.position ?? 0)
                    }))
                });
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.publish = async (req, res, next) => {
            try {
                const user = req.user;
                const { id } = req.params;
                const auction = await this.publishAuctionUseCase.execute(id, user.userId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auction });
            }
            catch (error) {
                next(error);
            }
        };
        this.list = async (req, res, next) => {
            try {
                const auctions = await this.getActiveAuctionsUseCase.execute();
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auctions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const auction = await this.getAuctionByIdUseCase.execute(id);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODE.NOT_FOUND).json({ success: false, message: error.message });
            }
        };
        this.enter = async (req, res, next) => {
            try {
                const user = req.user;
                const { id } = req.params;
                const participant = await this.enterAuctionUseCase.execute(id, user.userId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: participant });
            }
            catch (error) {
                next(error);
            }
        };
        this.revokeUser = async (req, res, next) => {
            try {
                const user = req.user;
                const { id } = req.params;
                const { userId } = req.body;
                const revoked = await this.revokeUserUseCase.execute(id, user.userId, userId);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: revoked });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUpcoming = async (req, res, next) => {
            try {
                const auctions = await this.getUpcomingAuctionsUseCase.execute();
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: auctions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCategories = async (req, res, next) => {
            try {
                const activeOnly = req.query.active === 'true';
                const categories = await this.getAuctionCategoriesUseCase.execute(activeOnly);
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: categories });
            }
            catch (error) {
                next(error);
            }
        };
        this.getConditions = async (req, res, next) => {
            try {
                const conditions = await this.getAuctionConditionsUseCase.execute();
                res.status(status_code_1.STATUS_CODE.SUCCESS).json({ success: true, data: conditions });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuctionController = AuctionController;
