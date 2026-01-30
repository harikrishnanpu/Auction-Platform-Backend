import { AuctionCondition } from '../auction-condition.entity';

export interface IAuctionConditionRepository {
  findAll(): Promise<AuctionCondition[]>;
  findById(id: string): Promise<AuctionCondition | null>;
  create(condition: AuctionCondition): Promise<AuctionCondition>;
  update(id: string, data: Partial<AuctionCondition>): Promise<AuctionCondition>;
  delete(id: string): Promise<void>;
}
