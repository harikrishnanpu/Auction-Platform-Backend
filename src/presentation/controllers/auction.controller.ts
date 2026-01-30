import { Request, Response, NextFunction } from "express";
import { GetActiveAuctionsUseCase } from "../../application/useCases/auction/get-active-auctions.usecase";
import { GetAuctionByIdUseCase } from "../../application/useCases/auction/get-auction-by-id.usecase";
import { CreateAuctionUseCase } from "../../application/useCases/seller/create-auction.usecase";
import { AddAuctionAssetsUseCase } from "../../application/useCases/auction/add-auction-assets.usecase";
import { PublishAuctionUseCase } from "../../application/useCases/seller/publish-auction.usecase";
import { EnterAuctionUseCase } from "../../application/useCases/auction/enter-auction.usecase";
import { RevokeUserUseCase } from "../../application/useCases/auction/revoke-user.usecase";

export class AuctionController {
    constructor(
        private createAuctionUseCase: CreateAuctionUseCase,
        private addAuctionAssetsUseCase: AddAuctionAssetsUseCase,
        private publishAuctionUseCase: PublishAuctionUseCase,
        private getActiveAuctionsUseCase: GetActiveAuctionsUseCase,
        private getAuctionByIdUseCase: GetAuctionByIdUseCase,
        private enterAuctionUseCase: EnterAuctionUseCase,
        private revokeUserUseCase: RevokeUserUseCase
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
                minBidIncrement: Number(req.body.min_bid_increment)
            });
            res.status(201).json({ success: true, data: auction });
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
}
