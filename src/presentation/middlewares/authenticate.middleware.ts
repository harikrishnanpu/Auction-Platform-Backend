import { tokenService } from '../../infrastructure/services/jwt/jwt.service';
import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decodedRefresh = tokenService.verifyRefreshToken(refreshToken);
        if (!decodedRefresh) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }

        const { userId, email, roles } = decodedRefresh as any;
        const newTokens = tokenService.generateTokens({ userId, email, roles });

        res.cookie('accessToken', newTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        (req as any).user = decodedRefresh;
        return next();
    }

    const decoded = tokenService.verifyAccessToken(accessToken);

    if (!decoded) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Invalid session' });
        }

        const decodedRefresh = tokenService.verifyRefreshToken(refreshToken);
        if (!decodedRefresh) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }

        const { userId, email, roles } = decodedRefresh as any;
        const newTokens = tokenService.generateTokens({ userId, email, roles });

        res.cookie('accessToken', newTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        (req as any).user = decodedRefresh;
        return next();
    }

    (req as any).user = decoded;
    next();
};
