import { IUserRepository } from "@domain/repositories/user.repository";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";
import { Result } from "@result/result";
import { IStorageService } from "@application/services/storage/storage.service";
import { IGetProfileUseCase } from "@application/interfaces/use-cases/user.usecase.interface";

export class GetProfileUseCase implements IGetProfileUseCase {
    constructor(
        private userRepository: IUserRepository,
        private storageService: IStorageService
    ) { }

    public async execute(userId: string): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            return Result.fail("User not found");
        }

        if (user.is_blocked) {
            return Result.fail("Account is blocked");
        }

        let avatarUrl = user.avatar_url;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
            try {
                avatarUrl = await this.storageService.getPresignedDownloadUrl(avatarUrl, 3600);
            } catch (error) {
                console.error("Failed to sign avatar URL", error);
            }
        }

        return Result.ok<UserResponseDto>({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: avatarUrl,
            created_at: user.created_at,
            has_password: !!user.password,
            is_google_user: !!user.googleId
        });
    }
}
