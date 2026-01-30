"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
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
                    minBidIncrement: Number(req.body.min_bid_increment)
                });
                res.status(201).json({ success: true, data: auction });
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
                res.status(200).json({ success: true, data: result });
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
                res.status(200).json({ success: true, data: auction });
            }
            catch (error) {
                next(error);
            }
        };
        this.list = async (req, res, next) => {
            try {
                const auctions = await this.getActiveAuctionsUseCase.execute();
                res.status(200).json({ success: true, data: auctions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const auction = await this.getAuctionByIdUseCase.execute(id);
                res.status(200).json({ success: true, data: auction });
            }
            catch (error) {
                res.status(404).json({ success: false, message: error.message });
            }
        };
        this.enter = async (req, res, next) => {
            try {
                const user = req.user;
                const { id } = req.params;
                const participant = await this.enterAuctionUseCase.execute(id, user.userId);
                res.status(200).json({ success: true, data: participant });
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
                res.status(200).json({ success: true, data: revoked });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUpcoming = async (req, res, next) => {
            try {
                const auctions = await this.getUpcomingAuctionsUseCase.execute();
                res.status(200).json({ success: true, data: auctions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCategories = async (req, res, next) => {
            try {
                const activeOnly = req.query.active === 'true';
                const categories = await this.getAuctionCategoriesUseCase.execute(activeOnly);
                res.status(200).json({ success: true, data: categories });
            }
            catch (error) {
                next(error);
            }
        };
        this.getConditions = async (req, res, next) => {
            try {
                const conditions = await this.getAuctionConditionsUseCase.execute();
                res.status(200).json({ success: true, data: conditions });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuctionController = AuctionController;
