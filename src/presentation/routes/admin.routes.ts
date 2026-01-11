import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';

import { AdminAuthController } from '../controllers/admin-auth.controller';

export class AdminRoutes {
    public router: Router;

    constructor(
        private adminController: AdminController,
        private adminAuthController: AdminAuthController
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/login', this.adminAuthController.login.bind(this.adminAuthController));
        this.router.get('/users', authenticate, authorize(['ADMIN']), this.adminController.getUsers.bind(this.adminController));
        this.router.get('/users/:id', authenticate, authorize(['ADMIN']), this.adminController.getUserById.bind(this.adminController));
    }
}
