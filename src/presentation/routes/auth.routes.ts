import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export class AuthRoutes {
  private _router: Router;

  constructor(private readonly _authController: AuthController) {
    this._router = Router();
  }

  register(): Router {
    this._router.post('/register', this._authController.register)
    this._router.post('/login', this._authController.login);
    this._router.post('/verify-email', this._authController.verifyEmail);
    this._router.post('/resend-otp', this._authController.resendOtp);
    this._router.post('/refresh-token', this._authController.refreshToken);
    return this._router;
  }
}