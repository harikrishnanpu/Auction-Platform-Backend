"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const userRoles = user.roles || []; // Array of strings/enums
        // userRoles might be a single string if legacy token, but we updated Login/Verify to use array.
        // If userRoles is empty, deny.
        const hasRole = userRoles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
