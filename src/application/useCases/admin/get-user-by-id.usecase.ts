import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { IGetUserByIdUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(id: string): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(id);
        if (!user) return Result.fail("User not found");

        return Result.ok<UserResponseDto>({
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
        });
    }
}
