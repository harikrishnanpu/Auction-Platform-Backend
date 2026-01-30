"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_service_1 = require("../../infrastructure/services/jwt/jwt.service");
const authenticate = (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    if (!accessToken) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Try to refresh if accessToken is missing but refreshToken is present
        const decodedRefresh = jwt_service_1.tokenService.verifyRefreshToken(refreshToken);
        if (!decodedRefresh) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        const { userId, email, roles } = decodedRefresh;
        const newTokens = jwt_service_1.tokenService.generateTokens({ userId, email, roles });
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
        req.user = decodedRefresh;
        return next();
    }
    const decoded = jwt_service_1.tokenService.verifyAccessToken(accessToken);
    if (!decoded) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Invalid session' });
        }
        const decodedRefresh = jwt_service_1.tokenService.verifyRefreshToken(refreshToken);
        if (!decodedRefresh) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        const { userId, email, roles } = decodedRefresh;
        const newTokens = jwt_service_1.tokenService.generateTokens({ userId, email, roles });
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
        req.user = decodedRefresh;
        return next();
    }
    req.user = decoded;
    next();
};
exports.authenticate = authenticate;
