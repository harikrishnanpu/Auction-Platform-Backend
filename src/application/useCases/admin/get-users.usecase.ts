import { IUserRepository } from "@domain/repositories/user.repository";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";
import { Result } from "@result/result";
import { IGetUsersUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class GetUsersUseCase implements IGetUsersUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<Result<{ users: UserResponseDto[]; total: number }>> {
        const { page, limit, search, sortBy, sortOrder } = params;
        const { users, total } = await this.userRepository.findAll(page, limit, search, sortBy, sortOrder);

        const userDtos: UserResponseDto[] = users.map(user => ({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        }));

        return Result.ok({
            users: userDtos,
            total
        });
    }
}
