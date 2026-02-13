import { Request, Response } from "express";
import {
    ICreateAuctionUseCase,
    IGenerateAuctionUploadUrlUseCase,
    IGetSellerAuctionsUseCase,
    IPublishAuctionUseCase,
    IUpdateAuctionUseCase,
    IGetSellerAuctionByIdUseCase,
    IPauseAuctionUseCase,
    IResumeAuctionUseCase,
    ISellerEndAuctionUseCase
} from 'application/interfaces/use-cases/seller.usecase.interface';
import { STATUS_CODE } from 'constants/status.code';
import { SELLER_MESSAGES } from 'constants/seller.constants';
import { AppError } from 'shared/app.error';
import expressAsyncHandler from 'express-async-handler';

export class SellerAuctionController {
    constructor(
        private createAuctionUseCase: ICreateAuctionUseCase,
        private generateUploadUrlUseCase: IGenerateAuctionUploadUrlUseCase,
        private getSellerAuctionsUseCase: IGetSellerAuctionsUseCase,
        private publishAuctionUseCase: IPublishAuctionUseCase,
        private getSellerAuctionByIdUseCase: IGetSellerAuctionByIdUseCase,
        private updateAuctionUseCase: IUpdateAuctionUseCase,
        private pauseAuctionUseCase: IPauseAuctionUseCase,
        private resumeAuctionUseCase: IResumeAuctionUseCase,
        private endAuctionUseCase: ISellerEndAuctionUseCase
    ) { }

    public create = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

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

        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        const auction = result.getValue();
        res.status(STATUS_CODE.CREATED).json({ success: true, data: { ...auction, auctionId: auction.id } });
    });

    public getUploadUrl = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { fileName, contentType } = req.body;
        const result = await this.generateUploadUrlUseCase.execute(sellerId, fileName, contentType);

        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public getMyAuctions = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const result = await this.getSellerAuctionsUseCase.execute(sellerId, req.query);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public getById = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { id } = req.params;
        const result = await this.getSellerAuctionByIdUseCase.execute(sellerId, id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.NOT_FOUND);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public publish = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { id } = req.params;
        const result = await this.publishAuctionUseCase.execute(sellerId, id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Auction published successfully" });
    });

    public update = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { id } = req.params;
        const result = await this.updateAuctionUseCase.execute(sellerId, id, req.body);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.getValue() });
    });

    public pause = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { id } = req.params;
        const result = await this.pauseAuctionUseCase.execute(sellerId, id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: SELLER_MESSAGES.AUCTION_PAUSED });
    });

    public resume = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { id } = req.params;
        const result = await this.resumeAuctionUseCase.execute(sellerId, id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: SELLER_MESSAGES.AUCTION_RESUMED });
    });

    public end = expressAsyncHandler(async (req: Request, res: Response) => {
        const sellerId = (req as any).user?.userId;
        if (!sellerId) throw new AppError(SELLER_MESSAGES.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

        const { id } = req.params;
        const result = await this.endAuctionUseCase.execute(sellerId, id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: SELLER_MESSAGES.AUCTION_ENDED });
    });
}
