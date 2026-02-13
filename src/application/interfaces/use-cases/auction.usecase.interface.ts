import { Result } from "@result/result";

export interface IGetActiveAuctionsUseCase {
    execute(params: any): Promise<Result<any>>;
}

export interface IGetAuctionByIdUseCase {
    execute(id: string): Promise<Result<any>>;
}

export interface IAddAuctionAssetsUseCase {
    execute(auctionId: string, sellerId: string, assets: any[]): Promise<Result<void>>;
}

export interface IEnterAuctionUseCase {
    execute(auctionId: string, userId: string): Promise<Result<any>>;
}

export interface IRevokeUserUseCase {
    execute(auctionId: string, actorId: string, userId: string): Promise<Result<any>>;
}

export interface IUnrevokeUserUseCase {
    execute(auctionId: string, actorId: string, userId: string): Promise<Result<any>>;
}

export interface IGetUpcomingAuctionsUseCase {
    execute(params: any): Promise<Result<any>>;
}

export interface IGetAuctionCategoriesUseCase {
    execute(activeOnly?: boolean): Promise<Result<any[]>>;
}

export interface IGetAuctionConditionsUseCase {
    execute(): Promise<Result<any[]>>;
}

export interface IEndAuctionUseCase {
    execute(auctionId: string, endedBy: 'SELLER' | 'SYSTEM'): Promise<Result<any>>;
}

export interface IPlaceBidUseCase {
    execute(auctionId: string, userId: string, amount: number): Promise<Result<any>>;
}

export interface ISendChatMessageUseCase {
    execute(auctionId: string, userId: string, message: string): Promise<Result<any>>;
}

export interface IGetAuctionRoomStateUseCase {
    execute(auctionId: string, limit?: number, userId?: string): Promise<Result<any>>;
}

export interface IGetAuctionActivitiesUseCase {
    execute(auctionId: string, limit?: number): Promise<Result<any[]>>;
}
