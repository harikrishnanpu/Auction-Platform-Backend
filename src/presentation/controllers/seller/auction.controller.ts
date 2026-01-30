import { Request, Response, NextFunction } from "express";
import { CreateAuctionUseCase } from "../../../application/useCases/seller/create-auction.usecase";
import { GenerateAuctionUploadUrlUseCase } from "../../../application/useCases/seller/generate-auction-upload-url.usecase";
import { GetSellerAuctionsUseCase } from "../../../application/useCases/seller/get-seller-auctions.usecase";
import { PublishAuctionUseCase } from "../../../application/useCases/seller/publish-auction.usecase";
import { GetSellerAuctionByIdUseCase } from "../../../application/useCases/seller/get-seller-auction-by-id.usecase";

export class SellerAuctionController {
    constructor(
        private createAuctionUseCase: CreateAuctionUseCase,
        private generateUploadUrlUseCase: GenerateAuctionUploadUrlUseCase,
        private getSellerAuctionsUseCase: GetSellerAuctionsUseCase,
        private publishAuctionUseCase: PublishAuctionUseCase,
        private getSellerAuctionByIdUseCase: GetSellerAuctionByIdUseCase
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Basic Auth Check (Robustness)
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(401).json({ message: "Unauthorized" });
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

            res.status(201).json({ success: true, data: auction });
        } catch (error) {
            console.error("Create Auction Error:", error);
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }

    public getUploadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(401).json({ message: "Unauthorized" });
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
                res.status(200).json({ success: true, data: result.getValue() });
            } else {
                res.status(400).json({ success: false, message: result.error });
            }

        } catch (error) {
            next(error);
        }
    }

    public getMyAuctions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const auctions = await this.getSellerAuctionsUseCase.execute(sellerId);
            res.status(200).json({ success: true, data: auctions });
        } catch (error) {
            next(error);
        }
    }

    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const auction = await this.getSellerAuctionByIdUseCase.execute(id, sellerId);
            res.status(200).json({ success: true, data: auction });
        } catch (error) {
            res.status(404).json({ success: false, message: (error as Error).message });
        }
    }

    public publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sellerId = (req as any).user?.userId;
            if (!sellerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { id } = req.params;
            const auction = await this.publishAuctionUseCase.execute(id, sellerId);
            res.status(200).json({ success: true, data: auction });
        } catch (error) {
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }
}
