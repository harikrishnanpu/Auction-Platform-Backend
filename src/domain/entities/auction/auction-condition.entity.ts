export class AuctionCondition {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdAt: Date
  ) {}

  static create(data: {
    id?: string;
    name: string;
    description?: string | null;
    createdAt?: Date;
  }): AuctionCondition {
    return new AuctionCondition(
      data.id || crypto.randomUUID(),
      data.name,
      data.description || null,
      data.createdAt || new Date()
    );
  }
}
