"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileUseCase = void 0;
const result_1 = require("@result/result");
const phone_vo_1 = require("@domain/value-objects/user/phone.vo");
class UpdateProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(request) {
        const user = await this.userRepository.findById(request.userId);
        if (!user)
            return result_1.Result.fail("User not found");
        let phone;
        if (request.phone) {
            const phoneResult = phone_vo_1.Phone.create(request.phone);
            if (phoneResult.isFailure)
                return result_1.Result.fail(phoneResult.error);
            phone = phoneResult.getValue();
        }
        user.update({
            name: request.name,
            address: request.address,
            avatar_url: request.avatar_url,
            phone: phone
        });
        await this.userRepository.save(user);
        return result_1.Result.ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            has_password: !!user.password,
            is_google_user: !!user.googleId
        });
    }
}
exports.UpdateProfileUseCase = UpdateProfileUseCase;
