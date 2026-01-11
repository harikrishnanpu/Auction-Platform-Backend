import { Request, Response, NextFunction } from 'express';

export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const userRoles = user.roles || []; // Array of strings/enums

        // userRoles might be a single string if legacy token, but we updated Login/Verify to use array.
        // If userRoles is empty, deny.

        const hasRole = userRoles.some((role: string) => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
