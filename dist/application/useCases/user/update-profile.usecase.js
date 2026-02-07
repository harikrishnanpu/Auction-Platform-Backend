"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
const phone_vo_1 = require("../../../domain/user/phone.vo");
class UpdateProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(dto) {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            return result_1.Result.fail("User not found");
        }
        if (dto.name) {
            // Assuming direct property update or add setter in Entity if strict DDD
            user.props.name = dto.name;
        }
        if (dto.address) {
            user.props.address = dto.address;
        }
        if (dto.avatar_url) {
            user.props.avatar_url = dto.avatar_url;
        }
        if (dto.phone && dto.phone !== user.phone) {
            const phoneOrError = phone_vo_1.Phone.create(dto.phone);
            if (phoneOrError.isFailure) {
                return result_1.Result.fail(phoneOrError.error);
            }
            user.props.phone = phoneOrError.getValue().value;
            // Maybe reset verification status if phone changed? 
            // For now, adhering to user request for simple edit.
        }
        await this.userRepository.save(user);
        return result_1.Result.ok({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            has_password: !!user.password,
            is_google_user: !!user.googleId
        });
    }
}
exports.UpdateProfileUseCase = UpdateProfileUseCase;
