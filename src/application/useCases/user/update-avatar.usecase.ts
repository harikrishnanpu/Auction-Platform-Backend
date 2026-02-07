import { IUserRepository } from "../../../domain/user/user.repository";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { IStorageService } from "../../services/storage/storage.service";

export interface UpdateAvatarDto {
    userId: string;
    avatarKey: string; // S3 file key, not the signed URL
}

export class UpdateAvatarUseCase {
    constructor(
        private userRepository: IUserRepository,
        private storageService: IStorageService
    ) { }

    public async execute(dto: UpdateAvatarDto): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(dto.userId);

        if (!user) {
            return Result.fail("User not found");
        }

        // Save the S3 key (not the signed URL) in the database
        (user as any).props.avatar_url = dto.avatarKey;

        await this.userRepository.save(user);

        // Generate a signed download URL for the response
        let avatarUrl = dto.avatarKey;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
            try {
                avatarUrl = await this.storageService.getPresignedDownloadUrl(avatarUrl, 3600);
            } catch (error) {
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
