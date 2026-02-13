import { Router } from "express";
import { KycController } from "../controllers/kyc/kyc.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

export class KycRoutes {
  private _router: Router;

  constructor(private readonly kycController: KycController) {
    this._router = Router();
  }

  register(): Router {
    this._router.post("/upload-url", authenticate, this.kycController.generateUploadUrl);
    this._router.post("/complete-upload", authenticate, this.kycController.completeUpload);
    this._router.get("/status", authenticate, this.kycController.getStatus);
    this._router.post("/submit", authenticate, this.kycController.submitKyc);
    return this._router;
  }
}
