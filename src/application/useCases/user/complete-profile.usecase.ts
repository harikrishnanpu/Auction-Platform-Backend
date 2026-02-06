import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserResponseDto } from "../../dtos/auth/auth.dto";

export class CompleteProfileUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, phone: string, address: string): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return Result.fail("User not found");
        }

        if (user.is_blocked) {
            return Result.fail("Account is blocked");
        }

        const updateResult = user.completeProfile(phone, address);
        if (updateResult.isFailure) {
            return Result.fail(updateResult.error as string);
        }

        await this.userRepository.save(user);

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        });
    }
}
