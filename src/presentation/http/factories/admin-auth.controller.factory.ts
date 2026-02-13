import { ILoginAdminUseCase } from "application/interfaces/use-cases/admin.usecase.interface";
import { AdminAuthController } from "../controllers/admin/admin-auth.controller";

export class AdminAuthControllerFactory {
    static create(loginAdminUseCase: ILoginAdminUseCase): AdminAuthController {
        return new AdminAuthController(loginAdminUseCase);
    }
}
