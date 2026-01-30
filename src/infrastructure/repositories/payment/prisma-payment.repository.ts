import { PrismaClient } from '@prisma/client';
import { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { PaymentEntity, CreatePaymentDTO, UpdatePaymentDTO } from '../../../domain/payment/payment.entity';

export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: CreatePaymentDTO): Promise<PaymentEntity> {
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

    async findById(id: string): Promise<PaymentEntity | null> {
        const payment = await this.prisma.auctionPayment.findUnique({
            where: { id }
        });
        return payment ? this.toDomain(payment) : null;
    }

    async findByAuctionId(auctionId: string): Promise<PaymentEntity[]> {
        const payments = await this.prisma.auctionPayment.findMany({
            where: { auction_id: auctionId },
            orderBy: { created_at: 'desc' }
        });
        return payments.map(p => this.toDomain(p));
    }

    async findByUserId(userId: string): Promise<PaymentEntity[]> {
        const payments = await this.prisma.auctionPayment.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        return payments.map(p => this.toDomain(p));
    }

    async findPendingByUser(userId: string): Promise<PaymentEntity[]> {
        const payments = await this.prisma.auctionPayment.findMany({
            where: {
                user_id: userId,
                status: 'PENDING'
            },
            orderBy: { created_at: 'desc' }
        });
        return payments.map(p => this.toDomain(p));
    }

    async findByOrderId(orderId: string): Promise<PaymentEntity | null> {
        const payment = await this.prisma.auctionPayment.findUnique({
            where: { razorpay_order_id: orderId }
        });
        return payment ? this.toDomain(payment) : null;
    }

    async update(id: string, data: UpdatePaymentDTO): Promise<PaymentEntity> {
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

    async delete(id: string): Promise<void> {
        await this.prisma.auctionPayment.delete({
            where: { id }
        });
    }

    private toDomain(payment: any): PaymentEntity {
        return {
            id: payment.id,
            auctionId: payment.auction_id,
            userId: payment.user_id,
            amount: payment.amount,
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
            status: payment.status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED',
            paymentMethod: payment.payment_method,
            failureReason: payment.failure_reason,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at
        };
    }
}
