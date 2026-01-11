"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const services_di_1 = require("../../Di/services.di");
const authenticate = (req, res, next) => {
    let token;
    // 1. Check Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // 2. Check Cookies
    else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = services_di_1.jwtService.verify(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
};
exports.authenticate = authenticate;
