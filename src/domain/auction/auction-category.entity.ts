export class AuctionCategory {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}

  static create(data: {
    id?: string;
    name: string;
    slug: string;
    isActive?: boolean;
    createdAt?: Date;
  }): AuctionCategory {
    return new AuctionCategory(
      data.id || crypto.randomUUID(),
      data.name,
      data.slug,
      data.isActive ?? true,
      data.createdAt || new Date()
    );
  }

  isActiveCategory(): boolean {
    return this.isActive;
  }
}
