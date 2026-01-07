import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";


export class AuthRoutes {



  private _router: Router;

    constructor(private readonly _authController: AuthController) {
        this._router = Router();
    }

  register(): Router {
        this._router.post('/register', this._authController.register)
        this._router.post('/login',  this._authController.login);
        return this._router;
  }
    
    
    
}