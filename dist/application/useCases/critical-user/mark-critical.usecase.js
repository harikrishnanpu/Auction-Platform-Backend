"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkCriticalUseCase = void 0;
class MarkCriticalUseCase {
    constructor(criticalUserRepository) {
        this.criticalUserRepository = criticalUserRepository;
    }
    async execute(userId, auctionId, reason, description, severity = 'HIGH') {
        console.log(`🚨 Marking user ${userId} as critical: ${reason}`);
        await this.criticalUserRepository.create({
            userId,
            auctionId,
            reason,
            description,
            severity
        });
        await this.criticalUserRepository.markUserAsCritical(userId);
        console.log(`✅ User ${userId} marked as critical`);
    }
}
exports.MarkCriticalUseCase = MarkCriticalUseCase;
