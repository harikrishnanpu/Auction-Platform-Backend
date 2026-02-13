import { Router } from 'express';
import { SellerAuctionController } from '../controllers/seller/auction.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from "@domain/entities/user/user.entity";

export class SellerRoutes {
    private _router: Router;

    constructor(
        private _sellerAuctionController: SellerAuctionController
    ) {
        this._router = Router();
    }

    public register() {

        this._router.use(authenticate);
        this._router.use(authorize([UserRole.SELLER, UserRole.ADMIN]));

        this._router.post('/auction', this._sellerAuctionController.create);
        this._router.post('/auction/upload-url', this._sellerAuctionController.getUploadUrl);


        this._router.get('/auctions', this._sellerAuctionController.getMyAuctions);
        this._router.get('/auctions/:id', this._sellerAuctionController.getById);


        this._router.patch('/auctions/:id', this._sellerAuctionController.update);

        this._router.post('/auction/:id/publish', this._sellerAuctionController.publish);
        this._router.post('/auctions/:id/pause', this._sellerAuctionController.pause);

        this._router.post('/auctions/:id/resume', this._sellerAuctionController.resume);
        this._router.post('/auctions/:id/end', this._sellerAuctionController.end);

        return this._router;
    }
}
