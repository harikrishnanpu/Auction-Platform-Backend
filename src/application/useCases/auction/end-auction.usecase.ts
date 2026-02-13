import { IAuctionRepository } from "@domain/entities/auction/repositories/auction.repository";
import { IBidRepository } from "@domain/entities/auction/repositories/bid.repository";
import { IAuctionActivityRepository } from "@domain/entities/auction/repositories/activity.repository";
import { IPaymentRepository } from "../../../domain/payment/payment.repository";
import { Result } from "@result/result";
import { IEndAuctionUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class EndAuctionUseCase implements IEndAuctionUseCase {
    constructor(
        private auctionRepository: IAuctionRepository,
        private bidRepository: IBidRepository,
        private activityRepository: IAuctionActivityRepository,
        private paymentRepository: IPaymentRepository
    ) { }

    async execute(auctionId: string, endedBy: 'SELLER' | 'SYSTEM'): Promise<Result<any>> {
        try {
            console.log(`🏁 Ending auction ${auctionId} by ${endedBy}`);

            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction) {
                return Result.fail("Auction not found");
            }

            if (auction.status === 'ENDED' || auction.status === 'CANCELLED') {
                console.log(`⚠️ Auction ${auctionId} is already ${auction.status}`);
                return Result.ok({
                    success: false,
                    winnerId: null,
                    winningBid: null,
                    paymentDeadline: null
                });
            }

            if (auction.status !== 'ACTIVE') {
                return Result.fail("Only active auctions can be ended");
            }

            const validBids = await this.bidRepository.findLatestValidByAuction(auctionId, 1000);

            let winnerId: string | null = null;
            let winningBid: number | null = null;
            let paymentDeadline: Date | null = null;

            if (validBids.length > 0) {
                validBids.sort((a: any, b: any) => b.amount - a.amount);
                const highestBid = validBids[0];

                winnerId = highestBid.userId;
                winningBid = highestBid.amount;
                paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

                console.log(`🏆 Winner: ${winnerId}, Amount: ₹${winningBid}`);

                await this.auctionRepository.update(auctionId, {
                    status: 'ENDED',
                    winnerId: winnerId,
                    winnerPaymentDeadline: paymentDeadline,
                    completionStatus: 'PENDING'
                });

                if (winnerId && winningBid) {
                    await this.paymentRepository.create({
                        auctionId,
                        userId: winnerId,
                        amount: winningBid
                    });
                }

                await this.activityRepository.logActivity(
                    auctionId,
                    'AUCTION_ENDED',
                    `Auction ended. Winner: ${winnerId}, Amount: ₹${winningBid}`,
                    winnerId
                );

                console.log(`✅ Auction ${auctionId} ended with winner ${winnerId}`);
            } else {
                await this.auctionRepository.update(auctionId, {
                    status: 'ENDED',
                    completionStatus: 'FAILED'
                });

                await this.activityRepository.logActivity(
                    auctionId,
                    'AUCTION_ENDED',
                    'Auction ended with no bids',
                    auction.sellerId
                );

                console.log(`❌ Auction ${auctionId} ended with no bids`);
            }

            return Result.ok({
                success: true,
                winnerId,
                winningBid,
                paymentDeadline
            });
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
