import jwt from 'jsonwebtoken';
import { IJwtService } from '../../domain/services/auth/auth.service';
import dotenv from 'dotenv';
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET_ACCESS_TOKEN;
const JWT_REFRESH_SECRET = process.env.JWT_SECRET_REFRESH_TOKEN;
export class JwtServiceImpl implements IJwtService {
    private readonly secret: string;
    private readonly refreshSecret: string;
    private readonly expiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.secret = JWT_SECRET as string;
        this.refreshSecret = JWT_REFRESH_SECRET as string;
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
