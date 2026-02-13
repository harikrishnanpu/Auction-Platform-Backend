"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionCategoriesUseCase = void 0;
const result_1 = require("@result/result");
class GetAuctionCategoriesUseCase {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(activeOnly = false) {
        try {
            let categories;
            if (activeOnly) {
                categories = await this.categoryRepository.findActive();
            }
            else {
                categories = await this.categoryRepository.findAll();
            }
            return result_1.Result.ok(categories);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetAuctionCategoriesUseCase = GetAuctionCategoriesUseCase;
