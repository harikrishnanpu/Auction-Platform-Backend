"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersUseCase = void 0;
const result_1 = require("@result/result");
class GetUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(params) {
        const { page, limit, search, sortBy, sortOrder } = params;
        const { users, total } = await this.userRepository.findAll(page, limit, search, sortBy, sortOrder);
        const userDtos = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at
        }));
        return result_1.Result.ok({
            users: userDtos,
            total
        });
    }
}
exports.GetUsersUseCase = GetUsersUseCase;
