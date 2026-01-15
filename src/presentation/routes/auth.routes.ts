import { Router } from "express";
import { UserAuthController } from "../controllers/user.auth.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

export class AuthRoutes {
  private _router: Router;

  constructor(private readonly _authController: UserAuthController) {
    this._router = Router();
  }

  register(): Router {
    this._router.post('/register', this._authController.register)
    this._router.post('/login', this._authController.login);
    this._router.post('/verify-email', this._authController.verifyEmail);
    this._router.post('/resend-otp', this._authController.resendOtp);
    this._router.post('/refresh-token', this._authController.refreshToken);
    this._router.post('/forgot-password', this._authController.forgotPassword);
    this._router.post('/reset-password', this._authController.resetPassword);
    this._router.post('/logout', this._authController.logout);
    this._router.get('/google', this._authController.googleAuth);
    this._router.get('/google/callback', this._authController.googleAuthCallback);
    this._router.get('/me', authenticate, this._authController.getProfile);

    return this._router;
  }
}