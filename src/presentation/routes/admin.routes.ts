import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller';

export class AdminRoutes {
    private _router: Router;

    constructor(
        private adminAuthController: AdminAuthController
    ) {
        this._router = Router();
    }

    public register() {
        this._router.post('/auth/login', this.adminAuthController.login.bind(this.adminAuthController));

        // this._router.get('/users', authenticate, requireRole([UserRole.ADMIN]), this.adminController.getUsers.bind(this.adminController));
        // this._router.get('/users/:id', authenticate, requireRole([UserRole.ADMIN]), this.adminController.getUserById.bind(this.adminController));
        // this._router.put('/users/:id', adminAuthenticate, authorize(['ADMIN']), this.adminController.updateUser.bind(this.adminController));
        // this._router.post('/users/:id/block', authenticate, requireRole([UserRole.ADMIN]), this.adminController.blockUser.bind(this.adminController));
        // this._router.delete('/users/:id', authenticate, requireRole([UserRole.ADMIN]), this.adminController.deleteUser.bind(this.adminController));

        // this._router.get('/sellers', authenticate, requireRole([UserRole.ADMIN]), this.adminController.getSellers.bind(this.adminController));
        // this._router.get('/sellers/:id', authenticate, requireRole([UserRole.ADMIN]), this.adminController.getSellerById.bind(this.adminController));
        // this._router.post('/sellers/:id/verify', authenticate, requireRole([UserRole.ADMIN]), this.adminController.verifySellerKyc.bind(this.adminController));
        // this._router.patch('/sellers/:id/block', adminAuthenticate, authorize(['ADMIN']), this.adminController.blockUser.bind(this.adminController));
        // this._router.post('/sellers/:id/assign-role', adminAuthenticate, authorize(['ADMIN']), this.adminController.assignSellerRole.bind(this.adminController));

        return this._router;
    }
}
