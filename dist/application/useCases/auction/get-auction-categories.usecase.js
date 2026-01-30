"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionCategoriesUseCase = void 0;
class GetAuctionCategoriesUseCase {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(activeOnly = false) {
        if (activeOnly) {
            return await this.categoryRepository.findActive();
        }
        return await this.categoryRepository.findAll();
    }
}
exports.GetAuctionCategoriesUseCase = GetAuctionCategoriesUseCase;
