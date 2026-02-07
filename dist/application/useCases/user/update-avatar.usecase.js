"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAvatarUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class UpdateAvatarUseCase {
    constructor(userRepository, storageService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }
    async execute(dto) {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        // Save the S3 key (not the signed URL) in the database
        user.props.avatar_url = dto.avatarKey;
        await this.userRepository.save(user);
        // Generate a signed download URL for the response
        let avatarUrl = dto.avatarKey;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
            try {
                avatarUrl = await this.storageService.getPresignedDownloadUrl(avatarUrl, 3600);
            }
            catch (error) {
                console.error("Failed to sign avatar URL", error);
            }
        }
        return result_1.Result.ok({
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
exports.UpdateAvatarUseCase = UpdateAvatarUseCase;
