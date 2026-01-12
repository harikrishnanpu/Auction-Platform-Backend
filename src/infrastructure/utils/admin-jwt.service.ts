import jwt from 'jsonwebtoken';
import { IJwtService } from '../../domain/services/auth/auth.service';
import dotenv from 'dotenv';
dotenv.config();

export class AdminJwtServiceImpl implements IJwtService {
    private readonly secret: string;
    private readonly refreshSecret: string;
    private readonly expiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.secret = process.env.ADMIN_JWT_SECRET || 'default_admin_secret_please_change';
        this.refreshSecret = process.env.ADMIN_JWT_REFRESH_SECRET || 'default_admin_refresh_secret_please_change';
        this.expiresIn = '15m'; 
        this.refreshExpiresIn = '7d';
    }

    sign(payload: object): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
    }

    signRefresh(payload: object): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn as any });
    }

    verify(token: string): any {
        try {
            return jwt.verify(token, this.secret);
        } catch (e) {
            return null;
        }
    }

    verifyRefresh(token: string): any {
        try {
            return jwt.verify(token, this.refreshSecret);
        } catch (e) {
            return null;
        }
    }
}
