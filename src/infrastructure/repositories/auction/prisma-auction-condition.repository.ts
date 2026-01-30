import { PrismaClient } from '@prisma/client';
import { IAuctionConditionRepository } from '../../../domain/auction/repositories/auction-condition.repository';
import { AuctionCondition } from '../../../domain/auction/auction-condition.entity';

export class PrismaAuctionConditionRepository implements IAuctionConditionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<AuctionCondition[]> {
    const conditions = await this.prisma.auctionCondition.findMany({
      orderBy: { name: 'asc' },
    });

    return conditions.map(cond => new AuctionCondition(
      cond.id,
      cond.name,
      cond.description,
      cond.created_at
    ));
  }

  async findById(id: string): Promise<AuctionCondition | null> {
    const condition = await this.prisma.auctionCondition.findUnique({
      where: { id },
    });

    if (!condition) return null;

    return new AuctionCondition(
      condition.id,
      condition.name,
      condition.description,
      condition.created_at
    );
  }

  async create(condition: AuctionCondition): Promise<AuctionCondition> {
    const created = await this.prisma.auctionCondition.create({
      data: {
        id: condition.id,
        name: condition.name,
        description: condition.description,
        created_at: condition.createdAt,
      },
    });

    return new AuctionCondition(
      created.id,
      created.name,
      created.description,
      created.created_at
    );
  }

  async update(id: string, data: Partial<AuctionCondition>): Promise<AuctionCondition> {
    const updated = await this.prisma.auctionCondition.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return new AuctionCondition(
      updated.id,
      updated.name,
      updated.description,
      updated.created_at
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.auctionCondition.delete({
      where: { id },
    });
  }
}
