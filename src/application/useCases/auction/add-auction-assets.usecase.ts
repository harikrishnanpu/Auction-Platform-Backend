import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { AuctionAsset } from "@domain/entities/auction/auction.entity";
import { v4 as uuidv4 } from "uuid";
import { Result } from "@result/result";
import { IAddAuctionAssetsUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class AddAuctionAssetsUseCase implements IAddAuctionAssetsUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(auctionId: string, sellerId: string, assets: any[]): Promise<Result<void>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return Result.fail("Auction not found");
            }

            const domainAssets = assets.map((asset) => new AuctionAsset(
                uuidv4(),
                auctionId,
                asset.assetType || asset.asset_type,
                asset.url,
                asset.position != null ? Number(asset.position) : 0
            ));

            await this.auctionRepository.addAssets(auctionId, domainAssets);
            return Result.ok<void>(undefined);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
