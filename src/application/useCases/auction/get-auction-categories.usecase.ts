import { IAuctionCategoryRepository } from '../../../domain/auction/repositories/auction-category.repository';
import { AuctionCategory } from '../../../domain/auction/auction-category.entity';

export class GetAuctionCategoriesUseCase {
  constructor(private readonly categoryRepository: IAuctionCategoryRepository) {}

  async execute(activeOnly: boolean = false): Promise<AuctionCategory[]> {
    if (activeOnly) {
      return await this.categoryRepository.findActive();
    }
    return await this.categoryRepository.findAll();
  }
}
