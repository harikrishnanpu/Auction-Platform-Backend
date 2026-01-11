import { IUserRepository } from "../../../domain/user/user.repository";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { UserId } from "../../../domain/user/user-id.vo";

export class GetProfileUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<UserResponseDto>> {
        const userIdResult = UserId.create(userId);
        if (userIdResult.isFailure) {
            return Result.fail(userIdResult.error as string);
        }

        const user = await this.userRepository.findById(userIdResult.getValue());

        if (!user) {
            return Result.fail("User not found");
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
