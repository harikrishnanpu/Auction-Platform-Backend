"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuctionCategoryUseCase = void 0;
const auction_category_entity_1 = require("../../../domain/auction/auction-category.entity");
class CreateAuctionCategoryUseCase {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(data) {
        // Check if slug already exists
        const existing = await this.categoryRepository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Category with this slug already exists');
        }
        const category = auction_category_entity_1.AuctionCategory.create({
            name: data.name,
            slug: data.slug,
            isActive: data.isActive ?? true,
        });
        return await this.categoryRepository.create(category);
    }
}
exports.CreateAuctionCategoryUseCase = CreateAuctionCategoryUseCase;
