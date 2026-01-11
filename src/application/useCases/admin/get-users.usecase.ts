import { IUserRepository } from "../../../domain/user/user.repository";
import { UserListResponseDto } from "../../dtos/admin/admin.dto";
import { Result } from "../../../domain/shared/result";
import { UserResponseDto } from "../../dtos/auth/auth.dto";

export class GetUsersUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(page: number, limit: number): Promise<Result<UserListResponseDto>> {
        const { users, total } = await this.userRepository.findAll(page, limit);

        const userDtos: UserResponseDto[] = users.map(user => ({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            // Omit tokens for listing
        }));

        return Result.ok<UserListResponseDto>({
            users: userDtos,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
