import jwt from 'jsonwebtoken';
import { IJwtService } from '../../domain/services/auth/auth.service';
import dotenv from 'dotenv';
dotenv.config();

export class JwtServiceImpl implements IJwtService {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || 'default_secret_please_change';
        this.expiresIn = '1h';
    }

    sign(payload: object): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
    }

    verify(token: string): any {
        try {
            return jwt.verify(token, this.secret);
        } catch (e) {
            return null;
        }
    }
}
