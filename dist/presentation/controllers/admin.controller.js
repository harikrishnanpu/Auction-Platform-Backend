"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
class AdminController {
    constructor(getUsersUseCase, getUserByIdUseCase) {
        this.getUsersUseCase = getUsersUseCase;
        this.getUserByIdUseCase = getUserByIdUseCase;
    }
    async getUsers(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await this.getUsersUseCase.execute(page, limit);
        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        }
        else {
            res.status(400).json({ message: result.error });
        }
    }
    async getUserById(req, res) {
        const id = req.params.id;
        const result = await this.getUserByIdUseCase.execute(id);
        if (result.isSuccess) {
            res.status(200).json(result.getValue());
        }
        else {
            res.status(404).json({ message: result.error });
        }
    }
}
exports.AdminController = AdminController;
