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
import { GetAdminStatsUseCase } from '../../application/useCases/admin/get-admin-stats.usecase';

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

    public async getStats(req: Request, res: Response): Promise<void> {
        const result = await this.getAdminStatsUseCase.execute();

        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async getUsers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const result = await this.getUsersUseCase.execute(page, limit, search, sortBy, sortOrder);

        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async getUserById(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        const result = await this.getUserByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        } else {
            res.status(404).json({ message: result.error });
        }
    }

    public async updateUser(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        const dto = req.body;

        const result = await this.updateUserUseCase.execute(id, dto);

        if (result.isSuccess) {
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async blockUser(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        const block = req.body.block === true;

        const result = await this.blockUserUseCase.execute(id, block);

        if (result.isSuccess) {
            res.status(200).json({ message: block ? 'User blocked successfully' : 'User unblocked successfully' });
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        const result = await this.deleteUserUseCase.execute(id);

        if (result.isSuccess) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async getSellers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this.getSellersUseCase.execute(page, limit);

        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async getSellerById(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        const result = await this.getSellerByIdUseCase.execute(id);

        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        } else {
            res.status(404).json({ message: result.error });
        }
    }

    public async verifySellerKyc(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        const verify = req.body.verify === true;

        const result = await this.verifySellerKycUseCase.execute(id, verify);

        if (result.isSuccess) {
            res.status(200).json({ message: verify ? 'Seller KYC verified successfully' : 'Seller KYC verification rejected' });
        } else {
            res.status(400).json({ message: result.error });
        }
    }

    public async assignSellerRole(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        const result = await this.assignSellerRoleUseCase.execute(id);

        if (result.isSuccess) {
            res.status(200).json({ message: 'Seller role assigned successfully' });
        } else {
            res.status(400).json({ message: result.error });
        }
    }
}
