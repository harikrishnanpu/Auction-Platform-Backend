import { IUserRepository } from "../../../domain/user/user.repository";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";

export class GetProfileUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            return Result.fail("User not found");
        }

        if (user.is_blocked) {
            return Result.fail("Account is blocked");
        }

        if (!user.is_active) {
            return Result.fail("Account is inactive");
        }

        if (!user.is_verified) {
            return Result.fail("User not verified");
        }

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_active: user.is_active,
            is_verified: user.is_verified,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        });
    }
}
