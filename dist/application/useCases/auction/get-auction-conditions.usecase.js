"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuctionConditionsUseCase = void 0;
const result_1 = require("@result/result");
class GetAuctionConditionsUseCase {
    constructor(conditionRepository) {
        this.conditionRepository = conditionRepository;
    }
    async execute() {
        try {
            const conditions = await this.conditionRepository.findAll();
            return result_1.Result.ok(conditions);
        }
        catch (error) {
            return result_1.Result.fail(error.message);
        }
    }
}
exports.GetAuctionConditionsUseCase = GetAuctionConditionsUseCase;
