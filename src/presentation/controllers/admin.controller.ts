import { Request, Response } from 'express';
import { GetUsersUseCase } from '../../application/useCases/admin/get-users.usecase';
import { GetUserByIdUseCase } from '../../application/useCases/admin/get-user-by-id.usecase';

export class AdminController {
    constructor(
        private getUsersUseCase: GetUsersUseCase,
        private getUserByIdUseCase: GetUserByIdUseCase
    ) { }

    public async getUsers(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this.getUsersUseCase.execute(page, limit);

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
}
