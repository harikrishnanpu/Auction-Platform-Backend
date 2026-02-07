"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPaymentRepository = void 0;
class PrismaPaymentRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const payment = await this.prisma.auctionPayment.create({
            data: {
                auction_id: data.auctionId,
                user_id: data.userId,
                amount: data.amount,
                status: 'PENDING'
            }
        });
        return this.toDomain(payment);
    }
    async findById(id) {
        const payment = await this.prisma.auctionPayment.findUnique({
            where: { id }
        });
        return payment ? this.toDomain(payment) : null;
    }
    async findByAuctionId(auctionId) {
        const payments = await this.prisma.auctionPayment.findMany({
            where: { auction_id: auctionId },
            orderBy: { created_at: 'desc' }
        });
        return payments.map(p => this.toDomain(p));
    }
    async findByUserId(userId) {
        const payments = await this.prisma.auctionPayment.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        return payments.map(p => this.toDomain(p));
    }
    async findPendingByUser(userId) {
        const payments = await this.prisma.auctionPayment.findMany({
            where: {
                user_id: userId,
                status: 'PENDING'
            },
            orderBy: { created_at: 'desc' }
        });
        return payments.map(p => this.toDomain(p));
    }
    async findByOrderId(orderId) {
        const payment = await this.prisma.auctionPayment.findUnique({
            where: { razorpay_order_id: orderId }
        });
        return payment ? this.toDomain(payment) : null;
    }
    async update(id, data) {
        const payment = await this.prisma.auctionPayment.update({
            where: { id },
            data: {
                razorpay_order_id: data.razorpayOrderId,
                razorpay_payment_id: data.razorpayPaymentId,
                razorpay_signature: data.razorpaySignature,
                status: data.status,
                payment_method: data.paymentMethod,
                failure_reason: data.failureReason
            }
        });
        return this.toDomain(payment);
    }
    async delete(id) {
        await this.prisma.auctionPayment.delete({
            where: { id }
        });
    }
    toDomain(payment) {
        return {
            id: payment.id,
            auctionId: payment.auction_id,
            userId: payment.user_id,
            amount: payment.amount,
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
            status: payment.status,
            paymentMethod: payment.payment_method,
            failureReason: payment.failure_reason,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at
        };
    }
}
exports.PrismaPaymentRepository = PrismaPaymentRepository;
