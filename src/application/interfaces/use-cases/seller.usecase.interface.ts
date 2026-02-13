import { Result } from "@result/result";

export interface ICreateAuctionUseCase {
    execute(sellerId: string, data: any): Promise<Result<any>>;
}

export interface IGenerateAuctionUploadUrlUseCase {
    execute(sellerId: string, fileName: string, fileType: string): Promise<Result<any>>;
}

export interface IGetSellerAuctionsUseCase {
    execute(sellerId: string, params: any): Promise<Result<any>>;
}

export interface IPublishAuctionUseCase {
    execute(sellerId: string, auctionId: string): Promise<Result<void>>;
}

export interface IUpdateAuctionUseCase {
    execute(sellerId: string, auctionId: string, data: any): Promise<Result<any>>;
}

export interface IGetSellerAuctionByIdUseCase {
    execute(sellerId: string, auctionId: string): Promise<Result<any>>;
}

export interface IPauseAuctionUseCase {
    execute(sellerId: string, auctionId: string): Promise<Result<void>>;
}

export interface IResumeAuctionUseCase {
    execute(sellerId: string, auctionId: string): Promise<Result<void>>;
}

export interface ISellerEndAuctionUseCase {
    execute(sellerId: string, auctionId: string): Promise<Result<void>>;
}
