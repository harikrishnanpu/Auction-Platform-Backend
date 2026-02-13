"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionCategory = void 0;
class AuctionCategory {
    constructor(id, name, slug, isActive, createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }
    static create(data) {
        return new AuctionCategory(data.id || crypto.randomUUID(), data.name, data.slug, data.isActive ?? true, data.createdAt || new Date());
    }
    isActiveCategory() {
        return this.isActive;
    }
}
exports.AuctionCategory = AuctionCategory;
