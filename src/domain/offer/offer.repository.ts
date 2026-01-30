import { OfferEntity, CreateOfferDTO, UpdateOfferDTO } from './offer.entity';

export interface IOfferRepository {
    create(data: CreateOfferDTO): Promise<OfferEntity>;
    findById(id: string): Promise<OfferEntity | null>;
    findByAuctionId(auctionId: string): Promise<OfferEntity[]>;
    findPendingByUser(userId: string): Promise<OfferEntity[]>;
    findPendingByAuction(auctionId: string): Promise<OfferEntity[]>;
    findExpired(): Promise<OfferEntity[]>;
    update(id: string, data: UpdateOfferDTO): Promise<OfferEntity>;
    delete(id: string): Promise<void>;
}
