import { Request, Response, NextFunction } from "express";
import { CreateAuctionUseCase } from "../../../application/useCases/seller/create-auction.usecase";
import { GenerateAuctionUploadUrlUseCase } from "../../../application/useCases/seller/generate-auction-upload-url.usecase";
import { GetSellerAuctionsUseCase } from "../../../application/useCases/seller/get-seller-auctions.usecase";
import { PublishAuctionUseCase } from "../../../application/useCases/seller/publish-auction.usecase";
import { UpdateAuctionUseCase } from "../../../application/useCases/seller/update-auction.usecase";
import { GetSellerAuctionByIdUseCase } from "../../../application/useCases/seller/get-seller-auction-by-id.usecase";
import { PauseAuctionUseCase } from "../../../application/useCases/seller/pause-auction.usecase";
import { ResumeAuctionUseCase } from "../../../application/useCases/seller/resume-auction.usecase";
import { EndAuctionUseCase } from "../../../application/useCases/seller/end-auction.usecase";
import { HttpStatus } from "../../../application/constants/http-status.constants";
import { ResponseMessages } from "../../../application/constants/response.messages";

export class SellerAuctionController {
    constructor(
        private createAuctionUseCase: CreateAuctionUseCase,
        private generateUploadUrlUseCase: GenerateAuctionUploadUrlUseCase,
        private getSellerAuctionsUseCase: GetSellerAuctionsUseCase,
        private publishAuctionUseCase: PublishAuctionUseCase,
        private getSellerAuctionByIdUseCase: GetSellerAuctionByIdUseCase,
        private updateAuctionUseCase: UpdateAuctionUseCase,
        private pauseAuctionUseCase: PauseAuctionUseCase,
        private resumeAuctionUseCase: ResumeAuctionUseCase,
        private endAuctionUseCase: EndAuctionUseCase
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
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

            res.status(HttpStatus.CREATED).json({ success: true, data: auction });
        } catch (error) {
            console.error("Create Auction Error:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public getUploadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const { fileName, contentType, mediaType } = req.body;

            const result = await this.generateUploadUrlUseCase.execute({
                sellerId,
                fileName,
                contentType,
                mediaType: mediaType as 'image' | 'video'
            });

            if (result.isSuccess) {
                res.status(HttpStatus.OK).json({ success: true, data: result.getValue() });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.error });
            }

        } catch (error) {
            next(error);
        }
    }

    public getMyAuctions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const auctions = await this.getSellerAuctionsUseCase.execute(sellerId);
            res.status(HttpStatus.OK).json({ success: true, data: auctions });
        } catch (error) {
            next(error);
        }
    }

    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const { id } = req.params;
            const auction = await this.getSellerAuctionByIdUseCase.execute(id, sellerId);
            res.status(HttpStatus.OK).json({ success: true, data: auction });
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ success: false, message: (error as Error).message });
        }
    }

    public publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const { id } = req.params;
            const auction = await this.publishAuctionUseCase.execute(id, sellerId);
            res.status(HttpStatus.OK).json({ success: true, data: auction });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
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
            res.status(HttpStatus.OK).json({ success: true, data: auction });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public pause = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const { id } = req.params;
            await this.pauseAuctionUseCase.execute(id, sellerId);
            res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.AUCTION_PAUSED_SUCCESS });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public resume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const { id } = req.params;
            await this.resumeAuctionUseCase.execute(id, sellerId);
            res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.AUCTION_RESUMED_SUCCESS });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public end = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const { id } = req.params;
            await this.endAuctionUseCase.execute(id, sellerId);
            res.status(HttpStatus.OK).json({ success: true, message: ResponseMessages.AUCTION_ENDED_SUCCESS });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }
}

