import { IAuctionCategoryRepository } from "@domain/entities/auction/repositories/auction-category.repository";
import { AuctionCategory } from "@domain/entities/auction/auction-category.entity";
import { Result } from "@result/result";
import { IGetAuctionCategoriesUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class GetAuctionCategoriesUseCase implements IGetAuctionCategoriesUseCase {
  constructor(private readonly categoryRepository: IAuctionCategoryRepository) { }

  async execute(activeOnly: boolean = false): Promise<Result<AuctionCategory[]>> {
    try {
      let categories: AuctionCategory[];
      if (activeOnly) {
        categories = await this.categoryRepository.findActive();
      } else {
        categories = await this.categoryRepository.findAll();
      }
      return Result.ok(categories);
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
