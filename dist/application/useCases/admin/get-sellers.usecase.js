"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSellersUseCase = void 0;
const result_1 = require("../../../domain/shared/result");
class GetSellersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(page, limit) {
        const { sellers, total } = await this.userRepository.findSellers(page, limit);
        return result_1.Result.ok({
            sellers,
            users: sellers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
}
exports.GetSellersUseCase = GetSellersUseCase;
