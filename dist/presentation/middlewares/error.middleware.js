"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const app_error_1 = require("../../shared/app.error");
const status_code_1 = require("../../constants/status.code");
const pino_logger_1 = require("../../infrastructure/logger/pino.logger");
const errorMiddleware = (err, req, res, next) => {
    pino_logger_1.logger.error(err.message);
    if (err instanceof app_error_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.statusCode,
            message: err.message,
        });
    }
    return res.status(status_code_1.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        code: status_code_1.STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
    });
};
exports.errorMiddleware = errorMiddleware;
