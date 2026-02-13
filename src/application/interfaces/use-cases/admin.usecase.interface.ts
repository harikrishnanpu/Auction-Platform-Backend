import { Result } from "@result/result";
import { UserResponseDto, LoginResponseDto, LoginUserDto } from "@application/dtos/auth/auth.dto";

export interface ILoginAdminUseCase {
    execute(dto: LoginUserDto): Promise<Result<LoginResponseDto>>;
}

export interface IGetUsersUseCase {
    execute(params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<Result<{ users: UserResponseDto[]; total: number }>>;
}

export interface IGetUserByIdUseCase {
    execute(id: string): Promise<Result<UserResponseDto>>;
}

export interface IUpdateUserUseCase {
    execute(id: string, data: any): Promise<Result<UserResponseDto>>;
}

export interface IBlockUserUseCase {
    execute(id: string, block: boolean): Promise<Result<void>>;
}

export interface IDeleteUserUseCase {
    execute(id: string): Promise<Result<void>>;
}

export interface IGetSellersUseCase {
    execute(params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; kycStatus?: string }): Promise<Result<{ sellers: UserResponseDto[]; total: number }>>;
}

export interface IGetSellerByIdUseCase {
    execute(id: string): Promise<Result<any>>;
}

export interface IVerifySellerKycUseCase {
    execute(userId: string, verify: boolean, reasonType?: string, reasonMessage?: string): Promise<Result<void>>;
}

export interface IAssignSellerRoleUseCase {
    execute(userId: string): Promise<Result<void>>;
}

export interface IGetAdminStatsUseCase {
    execute(): Promise<Result<any>>;
}
