import { Request, Response } from 'express';
import { CreatePaymentOrderUseCase } from '../../application/useCases/payment/create-payment-order.usecase';
import { VerifyPaymentUseCase } from '../../application/useCases/payment/verify-payment.usecase';
import { IPaymentRepository } from '../../domain/payment/payment.repository';
import { IAuctionRepository } from '../../domain/auction/repositories/auction.repository';
import { HttpStatus } from '../../application/constants/http-status.constants';
import { ResponseMessages } from '../../application/constants/response.messages';

export class PaymentController {
    constructor(
        private createPaymentOrderUseCase: CreatePaymentOrderUseCase,
        private verifyPaymentUseCase: VerifyPaymentUseCase,
        private paymentRepository: IPaymentRepository,
        private auctionRepository: IAuctionRepository
    ) { }

    public createOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            const { auctionId, amount } = req.body;

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const order = await this.createPaymentOrderUseCase.execute(auctionId, userId, amount);
            res.status(HttpStatus.OK).json({ success: true, order });
        } catch (error) {
            console.error('Create Order Error:', error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public verifyPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const result = await this.verifyPaymentUseCase.execute(req.body);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            console.error('Verify Payment Error:', error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    public getPendingPayments = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessages.UNAUTHORIZED });
                return;
            }

            const payments = await this.paymentRepository.findPendingByUser(userId);
            res.status(HttpStatus.OK).json({ success: true, data: payments });
        } catch (error) {
            console.error('Get Pending Payments Error:', error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }
}
