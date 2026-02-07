"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class GetUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(page, limit, search, sortBy, sortOrder) {
        const { users, total } = await this.userRepository.findAll(page, limit, search, sortBy, sortOrder);
        const userDtos = users.map(user => ({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
        }));
        return result_1.Result.ok({
            users: userDtos,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
exports.GetUsersUseCase = GetUsersUseCase;
