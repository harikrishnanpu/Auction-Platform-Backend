import { Request, Response, NextFunction } from "express";
import { GetActiveAuctionsUseCase } from "../../../application/useCases/auction/get-active-auctions.usecase";
import { GetAuctionByIdUseCase } from "../../../application/useCases/auction/get-auction-by-id.usecase";
import { CreateAuctionUseCase } from "../../../application/useCases/seller/create-auction.usecase";
import { AddAuctionAssetsUseCase } from "../../../application/useCases/auction/add-auction-assets.usecase";
import { PublishAuctionUseCase } from "../../../application/useCases/seller/publish-auction.usecase";
import { EnterAuctionUseCase } from "../../../application/useCases/auction/enter-auction.usecase";
import { RevokeUserUseCase } from "../../../application/useCases/auction/revoke-user.usecase";
import { GetUpcomingAuctionsUseCase } from "../../../application/useCases/auction/get-upcoming-auctions.usecase";
import { GetAuctionCategoriesUseCase } from "../../../application/useCases/auction/get-auction-categories.usecase";
import { GetAuctionConditionsUseCase } from "../../../application/useCases/auction/get-auction-conditions.usecase";

export class AuctionController {
    constructor(
        private createAuctionUseCase: CreateAuctionUseCase,
        private addAuctionAssetsUseCase: AddAuctionAssetsUseCase,
        private publishAuctionUseCase: PublishAuctionUseCase,
        private getActiveAuctionsUseCase: GetActiveAuctionsUseCase,
        private getUpcomingAuctionsUseCase: GetUpcomingAuctionsUseCase,
        private getAuctionByIdUseCase: GetAuctionByIdUseCase,
        private enterAuctionUseCase: EnterAuctionUseCase,
        private revokeUserUseCase: RevokeUserUseCase,
        private getAuctionCategoriesUseCase: GetAuctionCategoriesUseCase,
        private getAuctionConditionsUseCase: GetAuctionConditionsUseCase
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
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
            res.status(201).json({ success: true, data: { ...auction, auctionId: auction.id } });
        } catch (error) {
            next(error);
        }
    }

    public addAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;
            const assets = Array.isArray(req.body.assets) ? req.body.assets : [];
            const result = await this.addAuctionAssetsUseCase.execute({
                auctionId: id,
                sellerId: user.userId,
                assets: assets.map((asset: any) => ({
                    assetType: asset.asset_type,
                    url: asset.url,
                    position: Number(asset.position ?? 0)
                }))
            });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    public publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;
            const auction = await this.publishAuctionUseCase.execute(id, user.userId);
            res.status(200).json({ success: true, data: auction });
        } catch (error) {
            next(error);
        }
    }

    public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auctions = await this.getActiveAuctionsUseCase.execute();
            res.status(200).json({ success: true, data: auctions });
        } catch (error) {
            next(error);
        }
    }

    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const auction = await this.getAuctionByIdUseCase.execute(id);
            res.status(200).json({ success: true, data: auction });
        } catch (error) {
            res.status(404).json({ success: false, message: (error as Error).message });
        }
    }

    public enter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;
            const participant = await this.enterAuctionUseCase.execute(id, user.userId);
            res.status(200).json({ success: true, data: participant });
        } catch (error) {
            next(error);
        }
    }

    public revokeUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;
            const { userId } = req.body;
            const revoked = await this.revokeUserUseCase.execute(id, user.userId, userId);
            res.status(200).json({ success: true, data: revoked });
        } catch (error) {
            next(error);
        }
    }

    public getUpcoming = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auctions = await this.getUpcomingAuctionsUseCase.execute();
            res.status(200).json({ success: true, data: auctions });
        } catch (error) {
            next(error);
        }
    }

    public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const activeOnly = req.query.active === 'true';
            const categories = await this.getAuctionCategoriesUseCase.execute(activeOnly);
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    public getConditions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const conditions = await this.getAuctionConditionsUseCase.execute();
            res.status(200).json({ success: true, data: conditions });
        } catch (error) {
            next(error);
        }
    }
}
