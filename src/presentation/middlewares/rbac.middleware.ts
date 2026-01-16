import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../domain/user/user.entity';

export const requireRole = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            if (!user.roles || !Array.isArray(user.roles)) {
                return res.status(403).json({ message: "Access forbidden: No roles found" });
            }

            const hasRole = user.roles.some((role: UserRole) => allowedRoles.includes(role));

            if (!hasRole) {
                return res.status(403).json({ message: "Access forbidden: Insufficient permissions" });
            }

            next();
        } catch (error) {


            console.log("RBAC Middleware Error:", error);
            
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
