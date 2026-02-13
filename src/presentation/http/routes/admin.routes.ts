import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin/admin-auth.controller';
import { AdminController } from '../controllers/admin/admin.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from "@domain/entities/user/user.entity";

export class AdminRoutes {
    private _router: Router;

    constructor(
        private _adminAuthController: AdminAuthController,
        private _adminController: AdminController
    ) {
        this._router = Router();
    }

    public register() {
        this._router.post('/auth/login', this._adminAuthController.login);
        this._router.get('/stats', authenticate, authorize([UserRole.ADMIN]), this._adminController.getStats);

        this._router.get('/users', authenticate, authorize([UserRole.ADMIN]), this._adminController.getUsers);
        this._router.get('/users/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.getUserById);
        this._router.put('/users/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.updateUser);
        this._router.post('/users/:id/block', authenticate, authorize([UserRole.ADMIN]), this._adminController.blockUser);
        this._router.delete('/users/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.deleteUser);

        this._router.get('/sellers', authenticate, authorize([UserRole.ADMIN]), this._adminController.getSellers);
        this._router.get('/sellers/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.getSellerById);
        this._router.post('/sellers/:id/verify', authenticate, authorize([UserRole.ADMIN]), this._adminController.verifySellerKyc);
        this._router.post('/sellers/:id/assign-role', authenticate, authorize([UserRole.ADMIN]), this._adminController.assignSellerRole);

        return this._router;
    }
}
