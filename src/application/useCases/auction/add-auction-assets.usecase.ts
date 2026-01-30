import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { AuctionAsset } from "../../../domain/auction/auction.entity";
import { v4 as uuidv4 } from "uuid";

export interface AddAuctionAssetsDto {
    auctionId: string;
    sellerId: string;
    assets: Array<{
        assetType: "IMAGE" | "VIDEO";
        url: string;
        position: number;
    }>;
}

export class AddAuctionAssetsUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(dto: AddAuctionAssetsDto) {
        const auction = await this.auctionRepository.findById(dto.auctionId);
        if (!auction || auction.sellerId !== dto.sellerId) {
            throw new Error("Auction not found");
        }

        const assets = dto.assets.map((asset) => new AuctionAsset(
            uuidv4(),
            dto.auctionId,
            asset.assetType,
            asset.url,
            asset.position
        ));

        await this.auctionRepository.addAssets(dto.auctionId, assets);
        return { success: true };
    }
}
