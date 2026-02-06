import { IUserRepository } from "../../../domain/user/user.repository";
import { AdminUserDetailDto } from "../../dtos/admin/admin.dto";
import { Result } from "../../../domain/shared/result";

export class GetUserByIdUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(id: string): Promise<Result<AdminUserDetailDto>> {
        const user = await this.userRepository.findById(id);
        if (!user) return Result.fail("User not found");

        return Result.ok<AdminUserDetailDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            roles: user.roles,
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            joined_at: user.created_at
        });
    }
}
