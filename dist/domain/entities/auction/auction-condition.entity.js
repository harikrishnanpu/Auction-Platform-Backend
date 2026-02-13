"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionCondition = void 0;
class AuctionCondition {
    constructor(id, name, description, createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }
    static create(data) {
        return new AuctionCondition(data.id || crypto.randomUUID(), data.name, data.description || null, data.createdAt || new Date());
    }
}
exports.AuctionCondition = AuctionCondition;
