import {
    IGetActiveAuctionsUseCase,
    IGetAuctionByIdUseCase,
    IAddAuctionAssetsUseCase,
    IEnterAuctionUseCase,
    IRevokeUserUseCase,
    IGetUpcomingAuctionsUseCase,
    IGetAuctionCategoriesUseCase,
    IGetAuctionConditionsUseCase
} from "application/interfaces/use-cases/auction.usecase.interface";
import { ICreateAuctionUseCase, IPublishAuctionUseCase } from "application/interfaces/use-cases/seller.usecase.interface";
import { AuctionController } from "../controllers/auction/auction.controller";

export class AuctionControllerFactory {
    static create(
        createAuctionUseCase: ICreateAuctionUseCase,
        addAuctionAssetsUseCase: IAddAuctionAssetsUseCase,
        publishAuctionUseCase: IPublishAuctionUseCase,
        getActiveAuctionsUseCase: IGetActiveAuctionsUseCase,
        getUpcomingAuctionsUseCase: IGetUpcomingAuctionsUseCase,
        getAuctionByIdUseCase: IGetAuctionByIdUseCase,
        enterAuctionUseCase: IEnterAuctionUseCase,
        revokeUserUseCase: IRevokeUserUseCase,
        getAuctionCategoriesUseCase: IGetAuctionCategoriesUseCase,
        getAuctionConditionsUseCase: IGetAuctionConditionsUseCase
    ): AuctionController {
        return new AuctionController(
            createAuctionUseCase,
            addAuctionAssetsUseCase,
            publishAuctionUseCase,
            getActiveAuctionsUseCase,
            getUpcomingAuctionsUseCase,
            getAuctionByIdUseCase,
            enterAuctionUseCase,
            revokeUserUseCase,
            getAuctionCategoriesUseCase,
            getAuctionConditionsUseCase
        );
    }
}
