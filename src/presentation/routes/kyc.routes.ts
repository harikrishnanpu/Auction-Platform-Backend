import { Router } from 'express';
import { KycController } from '../controllers/kyc.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

export class KycRoutes {
    private _router: Router;

    constructor(private readonly kycController: KycController) {
        this._router = Router();
    }

    register(): Router {
        this._router.post(
            '/upload-url',
            authenticate,
            this.kycController.generateUploadUrl.bind(this.kycController)
        );
        this._router.post(
            '/complete-upload',
            authenticate,
            this.kycController.completeUpload.bind(this.kycController)
        );
        this._router.get(
            '/status',
            authenticate,
            this.kycController.getStatus.bind(this.kycController)
        );
        this._router.post(
            '/submit',
            authenticate,
            this.kycController.submitKyc.bind(this.kycController)
        );
        return this._router;
    }
}
