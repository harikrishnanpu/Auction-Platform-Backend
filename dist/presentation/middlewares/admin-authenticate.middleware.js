"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthenticate = void 0;
const jwt_service_1 = require("@infrastructure/services/jwt/jwt.service");
const adminAuthenticate = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt_service_1.tokenService.verifyAccessToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
};
exports.adminAuthenticate = adminAuthenticate;
