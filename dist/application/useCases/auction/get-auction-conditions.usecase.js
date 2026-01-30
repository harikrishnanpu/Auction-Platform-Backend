"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionConditionsUseCase = void 0;
class GetAuctionConditionsUseCase {
    constructor(conditionRepository) {
        this.conditionRepository = conditionRepository;
    }
    async execute() {
        return await this.conditionRepository.findAll();
    }
}
exports.GetAuctionConditionsUseCase = GetAuctionConditionsUseCase;
