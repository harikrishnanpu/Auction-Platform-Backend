export interface CriticalUserEntity {
    id: string;
    userId: string;
    auctionId: string | null;
    reason: string;
    description: string | null;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    resolved: boolean;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateCriticalUserDTO = {
    userId: string;
    auctionId?: string;
    reason: string;
    description?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
};

export type UpdateCriticalUserDTO = {
    resolved?: boolean;
    resolvedAt?: Date;
    description?: string;
};
