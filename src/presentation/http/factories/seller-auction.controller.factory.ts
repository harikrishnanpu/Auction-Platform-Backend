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
} from "application/interfaces/use-cases/seller.usecase.interface";
import { SellerAuctionController } from "../controllers/seller/auction.controller";

export class SellerAuctionControllerFactory {
    static create(
        createAuctionUseCase: ICreateAuctionUseCase,
        generateUploadUrlUseCase: IGenerateAuctionUploadUrlUseCase,
        getSellerAuctionsUseCase: IGetSellerAuctionsUseCase,
        publishAuctionUseCase: IPublishAuctionUseCase,
        getSellerAuctionByIdUseCase: IGetSellerAuctionByIdUseCase,
        updateAuctionUseCase: IUpdateAuctionUseCase,
        pauseAuctionUseCase: IPauseAuctionUseCase,
        resumeAuctionUseCase: IResumeAuctionUseCase,
        endAuctionUseCase: ISellerEndAuctionUseCase
    ): SellerAuctionController {
        return new SellerAuctionController(
            createAuctionUseCase,
            generateUploadUrlUseCase,
            getSellerAuctionsUseCase,
            publishAuctionUseCase,
            getSellerAuctionByIdUseCase,
            updateAuctionUseCase,
            pauseAuctionUseCase,
            resumeAuctionUseCase,
            endAuctionUseCase
        );
    }
}
