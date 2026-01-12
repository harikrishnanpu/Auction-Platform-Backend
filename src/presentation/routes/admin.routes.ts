import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authorize } from '../middlewares/authorize.middleware';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { adminAuthenticate } from '../middlewares/admin-authenticate.middleware';

export class AdminRoutes {
    private _router: Router;

    constructor(
        private adminController: AdminController,
        private adminAuthController: AdminAuthController
    ) {
        this._router = Router();
    }

    public register() {
        this._router.post('/auth/login', this.adminAuthController.login.bind(this.adminAuthController));
        
        this._router.get('/users', adminAuthenticate, authorize(['ADMIN']), this.adminController.getUsers.bind(this.adminController));
        this._router.get('/users/:id', adminAuthenticate, authorize(['ADMIN']), this.adminController.getUserById.bind(this.adminController));
        this._router.put('/users/:id', adminAuthenticate, authorize(['ADMIN']), this.adminController.updateUser.bind(this.adminController));
        this._router.patch('/users/:id/block', adminAuthenticate, authorize(['ADMIN']), this.adminController.blockUser.bind(this.adminController));
        this._router.delete('/users/:id', adminAuthenticate, authorize(['ADMIN']), this.adminController.deleteUser.bind(this.adminController));
        
        this._router.get('/sellers', adminAuthenticate, authorize(['ADMIN']), this.adminController.getSellers.bind(this.adminController));
        this._router.get('/sellers/:id', adminAuthenticate, authorize(['ADMIN']), this.adminController.getSellerById.bind(this.adminController));
        this._router.patch('/sellers/:id/verify-kyc', adminAuthenticate, authorize(['ADMIN']), this.adminController.verifySellerKyc.bind(this.adminController));
        this._router.patch('/sellers/:id/block', adminAuthenticate, authorize(['ADMIN']), this.adminController.blockUser.bind(this.adminController));
        this._router.post('/sellers/:id/assign-role', adminAuthenticate, authorize(['ADMIN']), this.adminController.assignSellerRole.bind(this.adminController));
        
        return this._router;
    }
}
