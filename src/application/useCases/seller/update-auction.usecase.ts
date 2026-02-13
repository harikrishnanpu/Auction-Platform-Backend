import { IAuctionRepository, UpdateAuctionDto } from "@domain/entities/auction/repositories/auction.repository";
import { Result } from "@result/result";
import { IUpdateAuctionUseCase } from "@application/interfaces/use-cases/seller.usecase.interface";

export class UpdateAuctionUseCase implements IUpdateAuctionUseCase {
    constructor(private auctionRepository: IAuctionRepository) { }

    async execute(sellerId: string, auctionId: string, dto: UpdateAuctionDto): Promise<Result<any>> {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.sellerId !== sellerId) {
                return Result.fail("Auction not found");
            }
            if (auction.status !== "DRAFT") {
                return Result.fail("Only draft auctions can be updated");
            }

            const startAt = dto.startAt ? new Date(dto.startAt) : auction.startAt;
            const endAt = dto.endAt ? new Date(dto.endAt) : auction.endAt;
            if (endAt <= startAt) {
                return Result.fail("End time must be after start time");
            }

            const antiSnipeThresholdSeconds = dto.antiSnipeThresholdSeconds ?? auction.antiSnipeThresholdSeconds;
            const antiSnipeExtensionSeconds = dto.antiSnipeExtensionSeconds ?? auction.antiSnipeExtensionSeconds;
            const maxExtensions = dto.maxExtensions ?? auction.maxExtensions;
            const bidCooldownSeconds = dto.bidCooldownSeconds ?? auction.bidCooldownSeconds;

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

            const updatedAuction = await this.auctionRepository.update(auctionId, {
                title: dto.title ?? auction.title,
                description: dto.description ?? auction.description,
                startAt,
                endAt,
                startPrice: dto.startPrice ?? auction.startPrice,
                minBidIncrement: dto.minBidIncrement ?? auction.minBidIncrement,
                antiSnipeThresholdSeconds,
                antiSnipeExtensionSeconds,
                maxExtensions,
                bidCooldownSeconds
            });
            return Result.ok(updatedAuction);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
