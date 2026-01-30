import { AuctionCategory } from '../auction-category.entity';

export interface IAuctionCategoryRepository {
  findAll(): Promise<AuctionCategory[]>;
  findById(id: string): Promise<AuctionCategory | null>;
  findBySlug(slug: string): Promise<AuctionCategory | null>;
  findActive(): Promise<AuctionCategory[]>;
  create(category: AuctionCategory): Promise<AuctionCategory>;
  update(id: string, data: Partial<AuctionCategory>): Promise<AuctionCategory>;
  delete(id: string): Promise<void>;
}
