import { tokenService } from '../../infrastructure/services/jwt/jwt.service';
import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    console.log("Token:", token);


    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = tokenService.verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    (req as any).user = decoded;

    next();
};
