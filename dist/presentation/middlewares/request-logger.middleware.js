"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = void 0;
const uuid_1 = require("uuid");
const requestLoggerMiddleware = (logger) => (req, res, next) => {
    const requestId = (0, uuid_1.v4)();
    const startTime = Date.now();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    logger.info(`request to ${req.originalUrl}`, {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });
    res.on("finish", () => {
        const durationMs = Date.now() - startTime;
        logger.info(`request COMPLETED: ${req.originalUrl}`, {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs
        });
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
