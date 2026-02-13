import { IAuctionConditionRepository } from '../../../domain/entities/auction/repositories/auction-condition.repository';
import { AuctionCondition } from '../../../domain/entities/auction/auction-condition.entity';

export class CreateAuctionConditionUseCase {
  constructor(private readonly conditionRepository: IAuctionConditionRepository) { }

  async execute(data: {
    name: string;
    description?: string;
  }): Promise<AuctionCondition> {
    const condition = AuctionCondition.create({
      name: data.name,
      description: data.description,
    });

    return await this.conditionRepository.create(condition);
  }
}
