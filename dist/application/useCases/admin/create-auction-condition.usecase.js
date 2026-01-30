"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuctionConditionUseCase = void 0;
const auction_condition_entity_1 = require("../../../domain/auction/auction-condition.entity");
class CreateAuctionConditionUseCase {
    constructor(conditionRepository) {
        this.conditionRepository = conditionRepository;
    }
    async execute(data) {
        const condition = auction_condition_entity_1.AuctionCondition.create({
            name: data.name,
            description: data.description,
        });
        return await this.conditionRepository.create(condition);
    }
}
exports.CreateAuctionConditionUseCase = CreateAuctionConditionUseCase;
