import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../../Di/services.di';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    console.log("Token", token);


    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwtService.verify(token);

    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    (req as any).user = decoded;

    next();
};
