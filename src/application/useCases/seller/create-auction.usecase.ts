import { IAuctionRepository } from "../../../domain/auction/repositories/auction.repository";
import { Auction } from "../../../domain/auction/auction.entity";
import { v4 as uuidv4 } from "uuid";

export interface CreateAuctionDTO {
    sellerId: string;
    title: string;
    description: string;
    startAt: string | Date;
    endAt: string | Date;
    startPrice: number;
    minBidIncrement: number;
    categoryId?: string;
    conditionId?: string;
    antiSnipeThresholdSeconds?: number;
    antiSnipeExtensionSeconds?: number;
    maxExtensions?: number;
    bidCooldownSeconds?: number;
}

export class CreateAuctionUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(dto: CreateAuctionDTO): Promise<Auction> {
        const start = new Date(dto.startAt);
        const end = new Date(dto.endAt);

        if (end <= start) {
            throw new Error("End time must be after start time");
        }

        const antiSnipeThresholdSeconds = dto.antiSnipeThresholdSeconds ?? 30;
        const antiSnipeExtensionSeconds = dto.antiSnipeExtensionSeconds ?? 30;
        const maxExtensions = dto.maxExtensions ?? 5;
        const bidCooldownSeconds = dto.bidCooldownSeconds ?? 60;

        const allowedThresholds = [30, 60];
        const allowedExtensions = [30, 60];
        const allowedMaxExtensions = [3, 5, 10];
        const allowedCooldowns = [30, 60];

        if (!allowedThresholds.includes(antiSnipeThresholdSeconds)) {
            throw new Error("Invalid anti-snipe threshold");
        }
        if (!allowedExtensions.includes(antiSnipeExtensionSeconds)) {
            throw new Error("Invalid anti-snipe extension");
        }
        if (!allowedMaxExtensions.includes(maxExtensions)) {
            throw new Error("Invalid max extensions");
        }
        if (!allowedCooldowns.includes(bidCooldownSeconds)) {
            throw new Error("Invalid bid cooldown");
        }

        const auctionId = uuidv4();

        const auction = new Auction(
            auctionId,
            dto.sellerId,
            dto.categoryId || null,
            dto.conditionId || null,
            dto.title,
            dto.description,
            start,
            end,
            dto.startPrice,
            dto.minBidIncrement,
            dto.startPrice,
            [],
            'DRAFT',
            false,
            0,
            antiSnipeThresholdSeconds,
            antiSnipeExtensionSeconds,
            maxExtensions,
            bidCooldownSeconds
        );
        return await this.auctionRepository.create(auction);
    }
}
