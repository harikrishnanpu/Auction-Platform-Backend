import { PrismaClient } from '@prisma/client';
import { IAuctionCategoryRepository } from '../../../domain/auction/repositories/auction-category.repository';
import { AuctionCategory } from '../../../domain/auction/auction-category.entity';

export class PrismaAuctionCategoryRepository implements IAuctionCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<AuctionCategory[]> {
    const categories = await this.prisma.auctionCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return categories.map(cat => new AuctionCategory(
      cat.id,
      cat.name,
      cat.slug,
      cat.is_active,
      cat.created_at
    ));
  }

  async findById(id: string): Promise<AuctionCategory | null> {
    const category = await this.prisma.auctionCategory.findUnique({
      where: { id },
    });

    if (!category) return null;

    return new AuctionCategory(
      category.id,
      category.name,
      category.slug,
      category.is_active,
      category.created_at
    );
  }

  async findBySlug(slug: string): Promise<AuctionCategory | null> {
    const category = await this.prisma.auctionCategory.findUnique({
      where: { slug },
    });

    if (!category) return null;

    return new AuctionCategory(
      category.id,
      category.name,
      category.slug,
      category.is_active,
      category.created_at
    );
  }

  async findActive(): Promise<AuctionCategory[]> {
    const categories = await this.prisma.auctionCategory.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });

    return categories.map(cat => new AuctionCategory(
      cat.id,
      cat.name,
      cat.slug,
      cat.is_active,
      cat.created_at
    ));
  }

  async create(category: AuctionCategory): Promise<AuctionCategory> {
    const created = await this.prisma.auctionCategory.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        is_active: category.isActive,
        created_at: category.createdAt,
      },
    });

    return new AuctionCategory(
      created.id,
      created.name,
      created.slug,
      created.is_active,
      created.created_at
    );
  }

  async update(id: string, data: Partial<AuctionCategory>): Promise<AuctionCategory> {
    const updated = await this.prisma.auctionCategory.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
      },
    });

    return new AuctionCategory(
      updated.id,
      updated.name,
      updated.slug,
      updated.is_active,
      updated.created_at
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.auctionCategory.delete({
      where: { id },
    });
  }
}
