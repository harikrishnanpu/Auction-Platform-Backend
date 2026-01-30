import { IAuctionConditionRepository } from '../../../domain/auction/repositories/auction-condition.repository';
import { AuctionCondition } from '../../../domain/auction/auction-condition.entity';

export class GetAuctionConditionsUseCase {
  constructor(private readonly conditionRepository: IAuctionConditionRepository) {}

  async execute(): Promise<AuctionCondition[]> {
    return await this.conditionRepository.findAll();
  }
}
