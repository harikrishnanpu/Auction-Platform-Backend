import { Request, Response, NextFunction } from "express";
import { GetActiveAuctionsUseCase } from "../../application/useCases/auction/get-active-auctions.usecase";

export class AuctionController {
    constructor(private getActiveAuctionsUseCase: GetActiveAuctionsUseCase) { }

    public getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auctions = await this.getActiveAuctionsUseCase.execute();
            res.status(200).json({ success: true, data: auctions });
        } catch (error) {
            next(error);
        }
    }
}
