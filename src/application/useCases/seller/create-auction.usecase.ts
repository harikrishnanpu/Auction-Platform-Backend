import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction, AuctionMedia } from "../../../domain/auction/auction.entity";
import { v4 as uuidv4 } from "uuid";

export interface CreateAuctionDTO {
    sellerId: string;
    title: string;
    description: string;
    category: string;
    condition: string;
    startPrice: number;
    minIncrement: number;
    startTime: string | Date;
    endTime: string | Date;
    images: string[]; // Still receiving just keys from frontend
    videoUrl?: string; // Optional key
}

export class CreateAuctionUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(dto: CreateAuctionDTO): Promise<Auction> {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);

        if (end <= start) {
            throw new Error("End time must be after start time");
        }

        const auctionId = uuidv4();

        // Construct AuctionMedia entities
        const mediaItems: AuctionMedia[] = [];

        // 1. Process Images
        dto.images.forEach((key, index) => {
            mediaItems.push(new AuctionMedia(
                uuidv4(),
                auctionId,
                dto.sellerId,
                'IMAGE',
                key,
                index === 0 // First image is primary
            ));
        });

        // 2. Process Video
        if (dto.videoUrl) {
            mediaItems.push(new AuctionMedia(
                uuidv4(),
                auctionId,
                dto.sellerId,
                'VIDEO',
                dto.videoUrl,
                false
            ));
        }

        const auction = new Auction(
            auctionId,
            dto.sellerId,
            dto.title,
            dto.description,
            dto.category,
            dto.condition,
            dto.startPrice,
            dto.minIncrement,
            start,
            end,
            mediaItems, // Pass full media objects
            'ACTIVE'
        );
        return await this.auctionRepository.create(auction);
    }
}
