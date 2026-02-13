"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAvatarUseCase = void 0;
const result_1 = require("@result/result");
class UpdateAvatarUseCase {
    constructor(userRepository, storageService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }
    async execute(request) {
        const user = await this.userRepository.findById(request.userId);
        if (!user)
            return result_1.Result.fail("User not found");
        user.update({ avatar_url: request.avatarKey });
        await this.userRepository.save(user);
        let avatarUrl = request.avatarKey;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
            try {
                avatarUrl = await this.storageService.getPresignedDownloadUrl(avatarUrl, 3600);
            }
            catch (error) {
                console.error("Failed to sign avatar URL", error);
            }
        }
        return result_1.Result.ok({
            id: user.id,
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
exports.UpdateAvatarUseCase = UpdateAvatarUseCase;
