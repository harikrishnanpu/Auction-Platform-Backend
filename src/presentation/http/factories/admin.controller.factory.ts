import {
    IGetUsersUseCase,
    IGetUserByIdUseCase,
    IUpdateUserUseCase,
    IBlockUserUseCase,
    IDeleteUserUseCase,
    IGetSellersUseCase,
    IGetSellerByIdUseCase,
    IVerifySellerKycUseCase,
    IAssignSellerRoleUseCase,
    IGetAdminStatsUseCase
} from "application/interfaces/use-cases/admin.usecase.interface";
import { AdminController } from "../controllers/admin/admin.controller";

export class AdminControllerFactory {
    static create(
        getUsersUseCase: IGetUsersUseCase,
        getUserByIdUseCase: IGetUserByIdUseCase,
        updateUserUseCase: IUpdateUserUseCase,
        blockUserUseCase: IBlockUserUseCase,
        deleteUserUseCase: IDeleteUserUseCase,
        getSellersUseCase: IGetSellersUseCase,
        getSellerByIdUseCase: IGetSellerByIdUseCase,
        verifySellerKycUseCase: IVerifySellerKycUseCase,
        assignSellerRoleUseCase: IAssignSellerRoleUseCase,
        getAdminStatsUseCase: IGetAdminStatsUseCase
    ): AdminController {
        return new AdminController(
            getUsersUseCase,
            getUserByIdUseCase,
            updateUserUseCase,
            blockUserUseCase,
            deleteUserUseCase,
            getSellersUseCase,
            getSellerByIdUseCase,
            verifySellerKycUseCase,
            assignSellerRoleUseCase,
            getAdminStatsUseCase
        );
    }
}
