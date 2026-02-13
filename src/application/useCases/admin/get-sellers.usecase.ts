import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { IGetSellersUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";

export class GetSellersUseCase implements IGetSellersUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; kycStatus?: string }): Promise<Result<{ sellers: UserResponseDto[]; total: number }>> {
        const { page, limit, search, sortBy, sortOrder, kycStatus } = params;
        const { sellers, total } = await this.userRepository.findSellers(page, limit, search, sortBy, sortOrder, kycStatus);

        return Result.ok({
            sellers: sellers.map(s => ({
                id: s.id!,
                name: s.name,
                email: s.email.getValue(),
                roles: s.roles,
                is_blocked: s.is_blocked,
                is_verified: s.is_verified,
                created_at: s.created_at
            })),
            total
        });
    }
}
