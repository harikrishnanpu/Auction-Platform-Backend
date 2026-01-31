"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionCronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
class AuctionCronService {
    constructor(prisma, endAuctionUseCase, handlePaymentExpiryUseCase, handleOfferExpiryUseCase) {
        this.prisma = prisma;
        this.endAuctionUseCase = endAuctionUseCase;
        this.handlePaymentExpiryUseCase = handlePaymentExpiryUseCase;
        this.handleOfferExpiryUseCase = handleOfferExpiryUseCase;
    }
    /**
     * Start all cron jobs
     */
    start() {
        console.log('Starting auction cron jobs...');
        // 1. Auto-end auctions (every 1 minute)
        this.startAutoEndAuctions();
        // 2. Check payment deadlines (every 5 minutes)
        this.startPaymentDeadlineCheck();
        // 3. Check offer expiries (every 5 minutes)
        this.startOfferExpiryCheck();
        console.log('✅ All cron jobs started successfully');
    }
    startAutoEndAuctions() {
        node_cron_1.default.schedule('* * * * *', async () => {
            try {
                console.log('🔍 Checking for auctions to auto-end...');
                const now = new Date();
                const expiredAuctions = await this.prisma.auction.findMany({
                    where: {
                        status: 'ACTIVE',
                        end_at: {
                            lte: now
                        }
                    }
                });
                if (expiredAuctions.length === 0) {
                    console.log('✅ No auctions to end');
                    return;
                }
                console.log(`Found ${expiredAuctions.length} auctions to end`);
                for (const auction of expiredAuctions) {
                    try {
                        await this.endAuctionUseCase.execute(auction.id, 'SYSTEM');
                        console.log(`Auto-ended auction: ${auction.id}`);
                    }
                    catch (error) {
                        console.error(`Failed to auto-end auction ${auction.id}:`, error);
                    }
                }
            }
            catch (error) {
                console.error('Error in auto-end auctions cron:', error);
            }
        });
        console.log('Auto-end auctions cron scheduled (every 1 minute)');
    }
    startPaymentDeadlineCheck() {
        node_cron_1.default.schedule('*/5 * * * *', async () => {
            try {
                console.log('Checking for expired payment deadlines...');
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
                    console.log('No expired payment deadlines');
                    return;
                }
                console.log(`Found ${expiredAuctions.length} expired payment deadlines`);
                for (const auction of expiredAuctions) {
                    try {
                        await this.handlePaymentExpiryUseCase.execute(auction.id);
                        console.log(`Handled payment expiry for auction: ${auction.id}`);
                    }
                    catch (error) {
                        console.error(`Failed to handle payment expiry for auction ${auction.id}:`, error);
                    }
                }
            }
            catch (error) {
                console.error('Error in payment deadline check cron:', error);
            }
        });
        console.log('Payment deadline check cron scheduled (every 5 minutes)');
    }
    startOfferExpiryCheck() {
        node_cron_1.default.schedule('*/5 * * * *', async () => {
            try {
                await this.handleOfferExpiryUseCase.execute();
            }
            catch (error) {
                console.error('Error in offer expiry check cron:', error);
            }
        });
        console.log('Offer expiry check cron scheduled (every 5 minutes)');
    }
    stop() {
        node_cron_1.default.getTasks().forEach(task => task.stop());
        console.log('All cron jobs stopped');
    }
}
exports.AuctionCronService = AuctionCronService;
