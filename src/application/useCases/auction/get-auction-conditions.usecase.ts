import { IAuctionConditionRepository } from "@domain/entities/auction/repositories/auction-condition.repository";
import { AuctionCondition } from "@domain/entities/auction/auction-condition.entity";
import { Result } from "@result/result";
import { IGetAuctionConditionsUseCase } from "@application/interfaces/use-cases/auction.usecase.interface";

export class GetAuctionConditionsUseCase implements IGetAuctionConditionsUseCase {
  constructor(private readonly conditionRepository: IAuctionConditionRepository) { }

  async execute(): Promise<Result<AuctionCondition[]>> {
    try {
      const conditions = await this.conditionRepository.findAll();
      return Result.ok(conditions);
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
