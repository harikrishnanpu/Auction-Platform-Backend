import { Router } from 'express';
import { AuctionController } from '../controllers/other/auction.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../../domain/user/user.entity';

export class AuctionRoutes {
    private _router: Router;

    constructor(private _auctionController: AuctionController) {
        this._router = Router();
    }

    public register() {
        this._router.post('/', authenticate, authorize([UserRole.SELLER, UserRole.ADMIN]), this._auctionController.create);
        this._router.post('/:id/assets', authenticate, authorize([UserRole.SELLER, UserRole.ADMIN]), this._auctionController.addAssets);
        this._router.post('/:id/publish', authenticate, authorize([UserRole.SELLER, UserRole.ADMIN]), this._auctionController.publish);
        this._router.post('/:id/revoke-user', authenticate, authorize([UserRole.SELLER, UserRole.ADMIN]), this._auctionController.revokeUser);

        this._router.get('/', this._auctionController.list);
        this._router.get('/active', this._auctionController.list);
        this._router.get('/upcoming', this._auctionController.getUpcoming);
        this._router.get('/categories', this._auctionController.getCategories);
        this._router.get('/conditions', this._auctionController.getConditions);
        this._router.get('/:id', this._auctionController.getById);
        this._router.post('/:id/enter', authenticate, this._auctionController.enter);
        return this._router;
    }
}
