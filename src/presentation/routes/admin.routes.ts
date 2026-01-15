import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../../domain/user/user.entity';

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
        this._router.get('/stats', authenticate, authorize([UserRole.ADMIN]), this._adminController.getStats.bind(this._adminController));

        // Management Routes
        this._router.get('/users', authenticate, authorize([UserRole.ADMIN]), this._adminController.getUsers.bind(this._adminController));
        this._router.get('/users/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.getUserById.bind(this._adminController));
        this._router.put('/users/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.updateUser.bind(this._adminController));
        this._router.post('/users/:id/block', authenticate, authorize([UserRole.ADMIN]), this._adminController.blockUser.bind(this._adminController));
        this._router.delete('/users/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.deleteUser.bind(this._adminController));

        this._router.get('/sellers', authenticate, authorize([UserRole.ADMIN]), this._adminController.getSellers.bind(this._adminController));
        this._router.get('/sellers/:id', authenticate, authorize([UserRole.ADMIN]), this._adminController.getSellerById.bind(this._adminController));
        this._router.post('/sellers/:id/verify', authenticate, authorize([UserRole.ADMIN]), this._adminController.verifySellerKyc.bind(this._adminController));
        this._router.post('/sellers/:id/assign-role', authenticate, authorize([UserRole.ADMIN]), this._adminController.assignSellerRole.bind(this._adminController));

        return this._router;
    }
}
