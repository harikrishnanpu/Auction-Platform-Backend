import { Request, Response } from 'express';
import {
    IGetUsersUseCase,
    IGetUserByIdUseCase,
    IUpdateUserUseCase,
    IBlockUserUseCase,
    IDeleteUserUseCase,
    IGetSellersUseCase,
    IGetSellerByIdUseCase,
    IVerifySellerKycUseCase,
    IAssignSellerRoleUseCase,
    IGetAdminStatsUseCase
} from 'application/interfaces/use-cases/admin.usecase.interface';
import { ADMIN_MESSAGES } from 'constants/admin.constants';
import { STATUS_CODE } from 'constants/status.code';
import { AppError } from 'shared/app.error';
import expressAsyncHandler from 'express-async-handler';

export class AdminController {
    constructor(
        private getUsersUseCase: IGetUsersUseCase,
        private getUserByIdUseCase: IGetUserByIdUseCase,
        private updateUserUseCase: IUpdateUserUseCase,
        private blockUserUseCase: IBlockUserUseCase,
        private deleteUserUseCase: IDeleteUserUseCase,
        private getSellersUseCase: IGetSellersUseCase,
        private getSellerByIdUseCase: IGetSellerByIdUseCase,
        private verifySellerKycUseCase: IVerifySellerKycUseCase,
        private assignSellerRoleUseCase: IAssignSellerRoleUseCase,
        private getAdminStatsUseCase: IGetAdminStatsUseCase
    ) { }

    public getStats = expressAsyncHandler(async (req: Request, res: Response) => {
        const result = await this.getAdminStatsUseCase.execute();
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: ADMIN_MESSAGES.ADMIN_STATS_FETCHED,
            data: result.getValue()
        });
    });

    public getUsers = expressAsyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const result = await this.getUsersUseCase.execute({ page, limit, search, sortBy, sortOrder });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: ADMIN_MESSAGES.USERS_FETCHED,
            data: result.getValue()
        });
    });

    public getUserById = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const result = await this.getUserByIdUseCase.execute(id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.NOT_FOUND);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: ADMIN_MESSAGES.USER_FETCHED,
            data: result.getValue()
        });
    });

    public updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const dto = req.body;
        const result = await this.updateUserUseCase.execute(id, dto);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: ADMIN_MESSAGES.USER_UPDATED });
    });

    public blockUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const block = req.body.block === true;
        const result = await this.blockUserUseCase.execute(id, block);

        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: block ? ADMIN_MESSAGES.USER_BLOCKED : ADMIN_MESSAGES.USER_UNBLOCKED
        });
    });

    public deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const result = await this.deleteUserUseCase.execute(id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: ADMIN_MESSAGES.USER_DELETED });
    });

    public getSellers = expressAsyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';
        const kycStatus = req.query.kycStatus as string;

        const result = await this.getSellersUseCase.execute({ page, limit, search, sortBy, sortOrder, kycStatus });
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: ADMIN_MESSAGES.SELLERS_FETCHED,
            data: result.getValue()
        });
    });

    public getSellerById = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const result = await this.getSellerByIdUseCase.execute(id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.NOT_FOUND);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: ADMIN_MESSAGES.SELLER_FETCHED,
            data: result.getValue()
        });
    });

    public verifySellerKyc = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const verify = req.body.verify === true;
        const reasonMessage = req.body.reasonMessage as string | undefined;

        const result = await this.verifySellerKycUseCase.execute(id, verify, undefined, reasonMessage);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: verify ? ADMIN_MESSAGES.SELLER_KYC_VERIFIED : ADMIN_MESSAGES.SELLER_KYC_REJECTED
        });
    });

    public assignSellerRole = expressAsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const result = await this.assignSellerRoleUseCase.execute(id);
        if (result.isFailure) throw new AppError(result.error!, STATUS_CODE.BAD_REQUEST);

        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: ADMIN_MESSAGES.SELLER_ROLE_ASSIGNED });
    });
}
