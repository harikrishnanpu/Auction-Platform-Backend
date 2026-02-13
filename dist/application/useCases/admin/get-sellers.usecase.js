"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellersUseCase = void 0;
const result_1 = require("@result/result");
class GetSellersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(params) {
        const { page, limit, search, sortBy, sortOrder, kycStatus } = params;
        const { sellers, total } = await this.userRepository.findSellers(page, limit, search, sortBy, sortOrder, kycStatus);
        return result_1.Result.ok({
            sellers: sellers.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email.getValue(),
                roles: s.roles,
                is_blocked: s.is_blocked,
                is_verified: s.is_verified,
                created_at: s.created_at
            })),
            total
        });
    }
}
exports.GetSellersUseCase = GetSellersUseCase;
