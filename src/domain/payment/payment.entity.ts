export interface PaymentEntity {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    paymentMethod: string | null;
    failureReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CreatePaymentDTO = {
    auctionId: string;
    userId: string;
    amount: number;
};

export type UpdatePaymentDTO = {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    paymentMethod?: string;
    failureReason?: string;
};
