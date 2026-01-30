import { Router } from 'express';
import { AuctionController } from '../controllers/auction.controller';

export class AuctionRoutes {
    private _router: Router;

    constructor(private _auctionController: AuctionController) {
        this._router = Router();
    }

    public register() {
        this._router.get('/active', this._auctionController.getActive);
        return this._router;
    }
}
