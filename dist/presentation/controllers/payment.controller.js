"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const http_status_constants_1 = require("../../application/constants/http-status.constants");
const response_messages_1 = require("../../application/constants/response.messages");
class PaymentController {
    constructor(createPaymentOrderUseCase, verifyPaymentUseCase, paymentRepository, auctionRepository) {
        this.createPaymentOrderUseCase = createPaymentOrderUseCase;
        this.verifyPaymentUseCase = verifyPaymentUseCase;
        this.paymentRepository = paymentRepository;
        this.auctionRepository = auctionRepository;
        this.createOrder = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { auctionId, amount } = req.body;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const order = await this.createPaymentOrderUseCase.execute(auctionId, userId, amount);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, order });
            }
            catch (error) {
                console.error('Create Order Error:', error);
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.verifyPayment = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const result = await this.verifyPaymentUseCase.execute(req.body);
                res.status(http_status_constants_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                console.error('Verify Payment Error:', error);
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
        this.getPendingPayments = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: response_messages_1.ResponseMessages.UNAUTHORIZED });
                    return;
                }
                const payments = await this.paymentRepository.findPendingByUser(userId);
                res.status(http_status_constants_1.HttpStatus.OK).json({ success: true, data: payments });
            }
            catch (error) {
                console.error('Get Pending Payments Error:', error);
                res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
            }
        };
    }
}
exports.PaymentController = PaymentController;
