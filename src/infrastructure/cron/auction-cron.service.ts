import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { EndAuctionUseCase } from '../../application/useCases/auction/end-auction.usecase';
import { HandlePaymentExpiryUseCase } from '../../application/useCases/payment/handle-payment-expiry.usecase';
import { HandleOfferExpiryUseCase } from '../../application/useCases/offer/handle-offer-expiry.usecase';

export class AuctionCronService {
    private prisma: PrismaClient;
    private endAuctionUseCase: EndAuctionUseCase;
    private handlePaymentExpiryUseCase: HandlePaymentExpiryUseCase;
    private handleOfferExpiryUseCase: HandleOfferExpiryUseCase;

    constructor(
        prisma: PrismaClient,
        endAuctionUseCase: EndAuctionUseCase,
        handlePaymentExpiryUseCase: HandlePaymentExpiryUseCase,
        handleOfferExpiryUseCase: HandleOfferExpiryUseCase
    ) {
        this.prisma = prisma;
        this.endAuctionUseCase = endAuctionUseCase;
        this.handlePaymentExpiryUseCase = handlePaymentExpiryUseCase;
        this.handleOfferExpiryUseCase = handleOfferExpiryUseCase;
    }

    /**
     * Start all cron jobs
     */
    start(): void {
        console.log('⏰ Starting auction cron jobs...');

        // 1. Auto-end auctions (every 1 minute)
        this.startAutoEndAuctions();

        // 2. Check payment deadlines (every 5 minutes)
        this.startPaymentDeadlineCheck();

        // 3. Check offer expiries (every 5 minutes)
        this.startOfferExpiryCheck();

        console.log('✅ All cron jobs started successfully');
    }

    /**
     * Cron: Auto-end auctions whose time has expired
     * Runs every 1 minute
     */
    private startAutoEndAuctions(): void {
        cron.schedule('* * * * *', async () => {
            try {
                console.log('🔍 Checking for auctions to auto-end...');

                const now = new Date();
                const expiredAuctions = await this.prisma.auction.findMany({
                    where: {
                        status: 'ACTIVE',
                        is_paused: false,
                        end_at: {
                            lte: now
                        }
                    }
                });

                if (expiredAuctions.length === 0) {
                    console.log('✅ No auctions to end');
                    return;
                }

                console.log(`⚠️ Found ${expiredAuctions.length} auctions to end`);

                for (const auction of expiredAuctions) {
                    try {
                        await this.endAuctionUseCase.execute(auction.id, 'SYSTEM');
                        console.log(`✅ Auto-ended auction: ${auction.id}`);
                    } catch (error) {
                        console.error(`❌ Failed to auto-end auction ${auction.id}:`, error);
                    }
                }
            } catch (error) {
                console.error('❌ Error in auto-end auctions cron:', error);
            }
        });

        console.log('✅ Auto-end auctions cron scheduled (every 1 minute)');
    }

    /**
     * Cron: Check payment deadlines
     * Runs every 5 minutes
     */
    private startPaymentDeadlineCheck(): void {
        cron.schedule('*/5 * * * *', async () => {
            try {
                console.log('🔍 Checking for expired payment deadlines...');

                const now = new Date();
                const expiredAuctions = await this.prisma.auction.findMany({
                    where: {
                        status: 'ENDED',
                        completion_status: 'PENDING',
                        winner_payment_deadline: {
                            lte: now
                        },
                        winner_id: {
                            not: null
                        }
                    }
                });

                if (expiredAuctions.length === 0) {
                    console.log('✅ No expired payment deadlines');
                    return;
                }

                console.log(`⚠️ Found ${expiredAuctions.length} expired payment deadlines`);

                for (const auction of expiredAuctions) {
                    try {
                        await this.handlePaymentExpiryUseCase.execute(auction.id);
                        console.log(`✅ Handled payment expiry for auction: ${auction.id}`);
                    } catch (error) {
                        console.error(`❌ Failed to handle payment expiry for auction ${auction.id}:`, error);
                    }
                }
            } catch (error) {
                console.error('❌ Error in payment deadline check cron:', error);
            }
        });

        console.log('✅ Payment deadline check cron scheduled (every 5 minutes)');
    }

    /**
     * Cron: Check offer expiries
     * Runs every 5 minutes
     */
    private startOfferExpiryCheck(): void {
        cron.schedule('*/5 * * * *', async () => {
            try {
                await this.handleOfferExpiryUseCase.execute();
            } catch (error) {
                console.error('❌ Error in offer expiry check cron:', error);
            }
        });

        console.log('✅ Offer expiry check cron scheduled (every 5 minutes)');
    }

    /**
     * Stop all cron jobs (for testing or graceful shutdown)
     */
    stop(): void {
        cron.getTasks().forEach(task => task.stop());
        console.log('🛑 All cron jobs stopped');
    }
}
