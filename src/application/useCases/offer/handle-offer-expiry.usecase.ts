import { IOfferRepository } from '../../../domain/offer/offer.repository';
import { RespondToOfferUseCase } from './respond-to-offer.usecase';

export class HandleOfferExpiryUseCase {
    constructor(
        private offerRepository: IOfferRepository,
        private respondToOfferUseCase: RespondToOfferUseCase
    ) {}

    async execute(): Promise<void> {
        console.log('⏰ Checking for expired offers...');

        // Find all expired offers
        const expiredOffers = await this.offerRepository.findExpired();

        if (expiredOffers.length === 0) {
            console.log('✅ No expired offers found');
            return;
        }

        console.log(`⚠️ Found ${expiredOffers.length} expired offers`);

        for (const offer of expiredOffers) {
            try {
                // Treat as declined - this will trigger offering to next bidder
                await this.respondToOfferUseCase.execute(offer.id, offer.userId, 'DECLINE');
                
                console.log(`✅ Processed expired offer ${offer.id}`);
            } catch (error) {
                console.error(`❌ Error processing expired offer ${offer.id}:`, error);
            }
        }
    }
}
