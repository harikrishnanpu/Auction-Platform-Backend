import { Request, Response } from 'express';
import { GetUsersUseCase } from '../../../application/useCases/admin/get-users.usecase';
import { GetUserByIdUseCase } from '../../../application/useCases/admin/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../../../application/useCases/admin/update-user.usecase';
import { BlockUserUseCase } from '../../../application/useCases/admin/block-user.usecase';
import { DeleteUserUseCase } from '../../../application/useCases/admin/delete-user.usecase';
import { GetSellersUseCase } from '../../../application/useCases/admin/get-sellers.usecase';
import { GetSellerByIdUseCase } from '../../../application/useCases/admin/get-seller-by-id.usecase';
import { VerifySellerKycUseCase } from '../../../application/useCases/admin/verify-seller-kyc.usecase';
import { AssignSellerRoleUseCase } from '../../../application/useCases/admin/assign-seller-role.usecase';
import { GetAdminStatsUseCase } from '@application/useCases/admin/get-admin-stats.usecase';
import { ADMIN_MESSAGES } from '../../../constants/admin.constants';
import { STATUS_CODE } from '../../../constants/status.code';

export class AdminController {
    constructor(
        private getUsersUseCase: GetUsersUseCase,
        private getUserByIdUseCase: GetUserByIdUseCase,
        private updateUserUseCase: UpdateUserUseCase,
        private blockUserUseCase: BlockUserUseCase,
        private deleteUserUseCase: DeleteUserUseCase,
        private getSellersUseCase: GetSellersUseCase,
        private getSellerByIdUseCase: GetSellerByIdUseCase,
        private verifySellerKycUseCase: VerifySellerKycUseCase,
        private assignSellerRoleUseCase: AssignSellerRoleUseCase,
        private getAdminStatsUseCase: GetAdminStatsUseCase
    ) { }

    public getStats = async (req: Request, res: Response): Promise<void> => {
        const result = await this.getAdminStatsUseCase.execute();

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: ADMIN_MESSAGES.ADMIN_STATS_FETCHED,
                data: result.getValue()
            });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public getUsers = async (req: Request, res: Response): Promise<void> => {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const result = await this.getUsersUseCase.execute(page, limit, search, sortBy, sortOrder);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: ADMIN_MESSAGES.USERS_FETCHED,
                data: result.getValue()
            });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public getUserById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.getUserByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: ADMIN_MESSAGES.USER_FETCHED,
                data: result.getValue()
            });
        } else {
            res.status(STATUS_CODE.NOT_FOUND).json({ success: false, message: result.error });
        }
    }

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const dto = req.body;

        const result = await this.updateUserUseCase.execute(id, dto);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: ADMIN_MESSAGES.USER_UPDATED });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public blockUser = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const block = req.body.block === true;

        const result = await this.blockUserUseCase.execute(id, block);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: block ? ADMIN_MESSAGES.USER_BLOCKED : ADMIN_MESSAGES.USER_UNBLOCKED
            });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.deleteUserUseCase.execute(id);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: ADMIN_MESSAGES.USER_DELETED });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public getSellers = async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';
        const kycStatus = req.query.kycStatus as string;

        const result = await this.getSellersUseCase.execute(page, limit, search, sortBy, sortOrder, kycStatus);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: ADMIN_MESSAGES.SELLERS_FETCHED,
                data: result.getValue()
            });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public getSellerById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.getSellerByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: ADMIN_MESSAGES.SELLER_FETCHED,
                data: result.getValue()
            });
        } else {
            res.status(STATUS_CODE.NOT_FOUND).json({ success: false, message: result.error });
        }
    }

    public verifySellerKyc = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const verify = req.body.verify === true;
        const reasonType = req.body.reasonType as string | undefined;
        const reasonMessage = req.body.reasonMessage as string | undefined;

        const result = await this.verifySellerKycUseCase.execute(id, verify, reasonType, reasonMessage);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: verify ? ADMIN_MESSAGES.SELLER_KYC_VERIFIED : ADMIN_MESSAGES.SELLER_KYC_REJECTED
            });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }

    public assignSellerRole = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.assignSellerRoleUseCase.execute(id);

        if (result.isSuccess) {
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: ADMIN_MESSAGES.SELLER_ROLE_ASSIGNED });
        } else {
            res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: result.error });
        }
    }
}
