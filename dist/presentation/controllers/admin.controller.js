"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
class AdminController {
    constructor(getUsersUseCase, getUserByIdUseCase, updateUserUseCase, blockUserUseCase, deleteUserUseCase, getSellersUseCase, getSellerByIdUseCase, verifySellerKycUseCase, assignSellerRoleUseCase, getAdminStatsUseCase) {
        this.getUsersUseCase = getUsersUseCase;
        this.getUserByIdUseCase = getUserByIdUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.blockUserUseCase = blockUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.getSellersUseCase = getSellersUseCase;
        this.getSellerByIdUseCase = getSellerByIdUseCase;
        this.verifySellerKycUseCase = verifySellerKycUseCase;
        this.assignSellerRoleUseCase = assignSellerRoleUseCase;
        this.getAdminStatsUseCase = getAdminStatsUseCase;
        this.getStats = async (req, res) => {
            const result = await this.getAdminStatsUseCase.execute();
            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.getUsers = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const result = await this.getUsersUseCase.execute(page, limit, search, sortBy, sortOrder);
            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.getUserById = async (req, res) => {
            const id = req.params.id;
            const result = await this.getUserByIdUseCase.execute(id);
            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            }
            else {
                res.status(404).json({ message: result.error });
            }
        };
        this.updateUser = async (req, res) => {
            const id = req.params.id;
            const dto = req.body;
            const result = await this.updateUserUseCase.execute(id, dto);
            if (result.isSuccess) {
                res.status(200).json({ message: 'User updated successfully' });
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.blockUser = async (req, res) => {
            const id = req.params.id;
            const block = req.body.block === true;
            const result = await this.blockUserUseCase.execute(id, block);
            if (result.isSuccess) {
                res.status(200).json({ message: block ? 'User blocked successfully' : 'User unblocked successfully' });
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.deleteUser = async (req, res) => {
            const id = req.params.id;
            const result = await this.deleteUserUseCase.execute(id);
            if (result.isSuccess) {
                res.status(200).json({ message: 'User deleted successfully' });
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.getSellers = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.getSellersUseCase.execute(page, limit);
            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.getSellerById = async (req, res) => {
            const id = req.params.id;
            const result = await this.getSellerByIdUseCase.execute(id);
            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            }
            else {
                res.status(404).json({ message: result.error });
            }
        };
        this.verifySellerKyc = async (req, res) => {
            const id = req.params.id;
            const verify = req.body.verify === true;
            const result = await this.verifySellerKycUseCase.execute(id, verify);
            if (result.isSuccess) {
                res.status(200).json({ message: verify ? 'Seller KYC verified successfully' : 'Seller KYC verification rejected' });
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
        this.assignSellerRole = async (req, res) => {
            const id = req.params.id;
            const result = await this.assignSellerRoleUseCase.execute(id);
            if (result.isSuccess) {
                res.status(200).json({ message: 'Seller role assigned successfully' });
            }
            else {
                res.status(400).json({ message: result.error });
            }
        };
    }
}
exports.AdminController = AdminController;
