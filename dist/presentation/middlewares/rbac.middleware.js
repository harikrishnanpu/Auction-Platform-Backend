"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            if (!user.roles || !Array.isArray(user.roles)) {
                return res.status(403).json({ message: "Access forbidden: No roles found" });
            }
            const hasRole = user.roles.some((role) => allowedRoles.includes(role));
            if (!hasRole) {
                return res.status(403).json({ message: "Access forbidden: Insufficient permissions" });
            }
            next();
        }
        catch (error) {
            console.log("RBAC Middleware Error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
};
exports.requireRole = requireRole;
