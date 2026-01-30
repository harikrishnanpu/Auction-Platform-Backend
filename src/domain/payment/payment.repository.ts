import { PaymentEntity, CreatePaymentDTO, UpdatePaymentDTO } from './payment.entity';

export interface IPaymentRepository {
    create(data: CreatePaymentDTO): Promise<PaymentEntity>;
    findById(id: string): Promise<PaymentEntity | null>;
    findByAuctionId(auctionId: string): Promise<PaymentEntity[]>;
    findByUserId(userId: string): Promise<PaymentEntity[]>;
    findPendingByUser(userId: string): Promise<PaymentEntity[]>;
    findByOrderId(orderId: string): Promise<PaymentEntity | null>;
    update(id: string, data: UpdatePaymentDTO): Promise<PaymentEntity>;
    delete(id: string): Promise<void>;
}
