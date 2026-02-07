import { IUserRepository } from "../../../domain/user/user.repository";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { IStorageService } from "../../services/storage/storage.service";

export class GetProfileUseCase {
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
                avatarUrl = await this.storageService.getPresignedDownloadUrl(avatarUrl, 3600); // 1 hour expiry
            } catch (error) {
                // Fallback or leave as key if signing fails? 
                // Better to leave as key or null? Let's leave as null to avoid broken image.
                // Or keep original to debug.
                console.error("Failed to sign avatar URL", error);
            }
        }

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone,
            address: user.address,
            avatar_url: avatarUrl,
            created_at: user.created_at,
            has_password: !!user.password,
            is_google_user: !!user.googleId
        });
    }
}
