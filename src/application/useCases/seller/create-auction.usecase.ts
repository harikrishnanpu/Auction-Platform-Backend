import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { Auction } from "@domain/entities/auction/auction.entity";
import { v4 as uuidv4 } from "uuid";
import { Result } from "@result/result";
import { ICreateAuctionUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class CreateAuctionUseCase implements ICreateAuctionUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(sellerId: string, data: any): Promise<Result<Auction>> {
        try {
            const start = new Date(data.startAt);
            const end = new Date(data.endAt);

            if (end <= start) {
                return Result.fail("End time must be after start time");
            }

            const antiSnipeThresholdSeconds = data.antiSnipeThresholdSeconds ?? 30;
            const antiSnipeExtensionSeconds = data.antiSnipeExtensionSeconds ?? 30;
            const maxExtensions = data.maxExtensions ?? 5;
            const bidCooldownSeconds = data.bidCooldownSeconds ?? 60;

            const allowedThresholds = [30, 60];
            const allowedExtensions = [30, 60];
            const allowedMaxExtensions = [3, 5, 10];
            const allowedCooldowns = [30, 60];

            if (!allowedThresholds.includes(antiSnipeThresholdSeconds)) {
                return Result.fail("Invalid anti-snipe threshold");
            }
            if (!allowedExtensions.includes(antiSnipeExtensionSeconds)) {
                return Result.fail("Invalid anti-snipe extension");
            }
            if (!allowedMaxExtensions.includes(maxExtensions)) {
                return Result.fail("Invalid max extensions");
            }
            if (!allowedCooldowns.includes(bidCooldownSeconds)) {
                return Result.fail("Invalid bid cooldown");
            }

            const auctionId = uuidv4();

            const auction = new Auction(
                auctionId,
                sellerId,
                data.categoryId || null,
                data.conditionId || null,
                data.title,
                data.description,
                start,
                end,
                data.startPrice,
                data.minBidIncrement,
                data.startPrice,
                [],
                'DRAFT',
                false,
                null,
                null,
                'PENDING',
                0,
                antiSnipeThresholdSeconds,
                antiSnipeExtensionSeconds,
                maxExtensions,
                bidCooldownSeconds
            );

            const createdAuction = await this.auctionRepository.create(auction);
            return Result.ok(createdAuction);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
