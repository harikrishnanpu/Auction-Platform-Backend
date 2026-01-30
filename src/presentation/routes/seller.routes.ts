import { Router } from 'express';
import { SellerAuctionController } from '../controllers/seller/auction.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../../domain/user/user.entity';

export class SellerRoutes {
    private _router: Router;

    constructor(
        private _sellerAuctionController: SellerAuctionController
    ) {
        this._router = Router();
    }

    public register() {
        // Apply authentication to all seller routes
        this._router.use(authenticate);
        // Authorization: Ensure user is a Seller (or Admin)
        this._router.use(authorize([UserRole.SELLER, UserRole.ADMIN]));

        this._router.post('/auction', this._sellerAuctionController.create);
        this._router.post('/auction/upload-url', this._sellerAuctionController.getUploadUrl);
        this._router.get('/auctions', this._sellerAuctionController.getMyAuctions);

        return this._router;
    }
}
