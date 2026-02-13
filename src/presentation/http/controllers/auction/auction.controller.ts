import { Request, Response } from "express";
import {
    IGetActiveAuctionsUseCase,
    IGetAuctionByIdUseCase,
    IAddAuctionAssetsUseCase,
    IEnterAuctionUseCase,
    IRevokeUserUseCase,
    IGetUpcomingAuctionsUseCase,
    IGetAuctionCategoriesUseCase,
    IGetAuctionConditionsUseCase
} from 'application/interfaces/use-cases/auction.usecase.interface';
import { ICreateAuctionUseCase, IPublishAuctionUseCase } from 'application/interfaces/use-cases/seller.usecase.interface';
import { STATUS_CODE } from 'constants/status.code';
import { AppError } from 'shared/app.error';
import expressAsyncHandler from 'express-async-handler';

export class AuctionController {
    constructor(
        private createAuctionUseCase: ICreateAuctionUseCase,
        private addAuctionAssetsUseCase: IAddAuctionAssetsUseCase,
        private publishAuctionUseCase: IPublishAuctionUseCase,
        private getActiveAuctionsUseCase: IGetActiveAuctionsUseCase,
        private getUpcomingAuctionsUseCase: IGetUpcomingAuctionsUseCase,
        private getAuctionByIdUseCase: IGetAuctionByIdUseCase,
        private enterAuctionUseCase: IEnterAuctionUseCase,
        private revokeUserUseCase: IRevokeUserUseCase,
        private getAuctionCategoriesUseCase: IGetAuctionCategoriesUseCase,
        private getAuctionConditionsUseCase: IGetAuctionConditionsUseCase
    ) { }

    public create = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) throw new AppError("Unauthorized", STATUS_CODE.UNAUTHORIZED);

        const result = await this.createAuctionUseCase.execute(userId, req.body);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        const auction = result.getValue();
        res.status(STATUS_CODE.CREATED).json({ success: true, data: { ...auction, auctionId: auction.id } });
    });

    public addAssets = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const sellerId = (req as any).user?.userId;
        const assets = Array.isArray(req.body.assets) ? req.body.assets : [];
        const result = await this.addAuctionAssetsUseCase.execute(id, sellerId, assets);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public publish = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        const { id } = req.params;
        const result = await this.publishAuctionUseCase.execute(userId, id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Auction published successfully" });
    });

    public list = expressAsyncHandler(async (req: Request, res: Response) => {
        const result = await this.getActiveAuctionsUseCase.execute(req.query);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public getById = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.getAuctionByIdUseCase.execute(id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.NOT_FOUND);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public enter = expressAsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        const { id } = req.params;
        if (!userId) throw new AppError("Unauthorized", STATUS_CODE.UNAUTHORIZED);

        const result = await this.enterAuctionUseCase.execute(id, userId);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public revokeUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const actorId = (req as any).user?.userId;
        const { userId } = req.body;
        const result = await this.revokeUserUseCase.execute(id, actorId, userId);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "User revoked successfully" });
    });

    public getUpcoming = expressAsyncHandler(async (req: Request, res: Response) => {
        const result = await this.getUpcomingAuctionsUseCase.execute(req.query);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public getCategories = expressAsyncHandler(async (req: Request, res: Response) => {
        const result = await this.getAuctionCategoriesUseCase.execute();
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public getConditions = expressAsyncHandler(async (req: Request, res: Response) => {
        const result = await this.getAuctionConditionsUseCase.execute();
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });
}
