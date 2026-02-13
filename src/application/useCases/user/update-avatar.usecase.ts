import { IUserRepository } from "@domain/repositories/user.repository";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";
import { Result } from "@result/result";
import { IStorageService } from "@application/services/storage/storage.service";
import { IUpdateAvatarUseCase } from "@application/interfaces/use-cases/user.usecase.interface";

export interface UpdateAvatarRequest {
    userId: string;
    avatarKey: string;
}

export class UpdateAvatarUseCase implements IUpdateAvatarUseCase {
    constructor(
        private userRepository: IUserRepository,
        private storageService: IStorageService
    ) { }

    public async execute(request: { userId: string; avatarKey: string }): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(request.userId);
        if (!user) return Result.fail("User not found");

        user.update({ avatar_url: request.avatarKey });
        await this.userRepository.save(user);

        let avatarUrl = request.avatarKey;
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
