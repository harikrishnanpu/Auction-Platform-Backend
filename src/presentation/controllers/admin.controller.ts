import { Request, Response } from 'express';
import { GetUsersUseCase } from '../../application/useCases/admin/get-users.usecase';
import { GetUserByIdUseCase } from '../../application/useCases/admin/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../../application/useCases/admin/update-user.usecase';
import { BlockUserUseCase } from '../../application/useCases/admin/block-user.usecase';
import { DeleteUserUseCase } from '../../application/useCases/admin/delete-user.usecase';
import { GetSellersUseCase } from '../../application/useCases/admin/get-sellers.usecase';
import { GetSellerByIdUseCase } from '../../application/useCases/admin/get-seller-by-id.usecase';
import { VerifySellerKycUseCase } from '../../application/useCases/admin/verify-seller-kyc.usecase';
import { AssignSellerRoleUseCase } from '../../application/useCases/admin/assign-seller-role.usecase';
import { GetAdminStatsUseCase } from '@application/useCases/admin/get-admin-stats.usecase';
import { GetAdminAuctionsUseCase } from '@application/useCases/admin/get-admin-auctions.usecase';
import { GetAdminAuctionByIdUseCase } from '@application/useCases/admin/get-admin-auction-by-id.usecase';
import { HttpStatus } from '../../application/constants/http-status.constants';
import { ResponseMessages } from '../../application/constants/response.messages';

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
        private getAdminStatsUseCase: GetAdminStatsUseCase,
        private getAdminAuctionsUseCase: GetAdminAuctionsUseCase,
        private getAdminAuctionByIdUseCase: GetAdminAuctionByIdUseCase
    ) { }

    public getStats = async (req: Request, res: Response): Promise<void> => {
        const result = await this.getAdminStatsUseCase.execute();

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public getAuctions = async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const status = req.query.status as string;
        const sellerId = req.query.sellerId as string;
        const categoryId = req.query.categoryId as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const result = await this.getAdminAuctionsUseCase.execute(
            page,
            limit,
            { search, status, sellerId, categoryId },
            { field: sortBy, order: sortOrder }
        );

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public getAuctionById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const result = await this.getAdminAuctionByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.NOT_FOUND).json({ message: result.error });
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
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public getUserById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.getUserByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.NOT_FOUND).json({ message: result.error });
        }
    }

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const dto = req.body;

        const result = await this.updateUserUseCase.execute(id, dto);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json({ message: ResponseMessages.USER_UPDATED_SUCCESS });
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public blockUser = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const block = req.body.block === true;

        const result = await this.blockUserUseCase.execute(id, block);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json({ message: block ? ResponseMessages.USER_BLOCKED_SUCCESS : ResponseMessages.USER_UNBLOCKED_SUCCESS });
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.deleteUserUseCase.execute(id);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json({ message: ResponseMessages.USER_DELETED_SUCCESS });
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public getSellers = async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this.getSellersUseCase.execute(page, limit);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public getSellerById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.getSellerByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json(result.getValue());
        } else {
            res.status(HttpStatus.NOT_FOUND).json({ message: result.error });
        }
    }

    public verifySellerKyc = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const verify = req.body.verify === true;

        const result = await this.verifySellerKycUseCase.execute(id, verify);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json({ message: verify ? ResponseMessages.SELLER_KYC_VERIFIED : ResponseMessages.SELLER_KYC_REJECTED });
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }

    public assignSellerRole = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;

        const result = await this.assignSellerRoleUseCase.execute(id);

        if (result.isSuccess) {
            res.status(HttpStatus.OK).json({ message: ResponseMessages.SELLER_ROLE_ASSIGNED });
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({ message: result.error });
        }
    }
}

