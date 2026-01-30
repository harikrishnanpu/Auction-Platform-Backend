import { IAuctionCategoryRepository } from '../../../domain/auction/repositories/auction-category.repository';
import { AuctionCategory } from '../../../domain/auction/auction-category.entity';

export class CreateAuctionCategoryUseCase {
  constructor(private readonly categoryRepository: IAuctionCategoryRepository) {}

  async execute(data: {
    name: string;
    slug: string;
    isActive?: boolean;
  }): Promise<AuctionCategory> {
    // Check if slug already exists
    const existing = await this.categoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error('Category with this slug already exists');
    }

    const category = AuctionCategory.create({
      name: data.name,
      slug: data.slug,
      isActive: data.isActive ?? true,
    });

    return await this.categoryRepository.create(category);
  }
}
