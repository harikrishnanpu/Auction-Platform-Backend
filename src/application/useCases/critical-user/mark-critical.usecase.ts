import { ICriticalUserRepository } from '../../../domain/entities/critical-user/critical-user.repository';

export class MarkCriticalUseCase {
    constructor(private criticalUserRepository: ICriticalUserRepository) { }

    async execute(
        userId: string,
        auctionId: string,
        reason: string,
        description?: string,
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
    ): Promise<void> {
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
