import { Request, Response, NextFunction } from 'express';
import { adminJwtService } from '../../Di/services.di';

export const adminAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = adminJwtService.verify(token);

    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    (req as any).user = decoded;
    next();
};
