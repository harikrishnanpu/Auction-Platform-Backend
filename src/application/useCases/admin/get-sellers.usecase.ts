import { IUserRepository } from "../../../domain/user/user.repository";
import { UserListResponseDto } from "../../dtos/admin/admin.dto";
import { Result } from "../../../domain/shared/result";

export class GetSellersUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(page: number, limit: number): Promise<Result<UserListResponseDto & { sellers: any[] }>> {
        const { sellers, total } = await this.userRepository.findSellers(page, limit);

        return Result.ok({
            sellers,
            users: sellers as any,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
