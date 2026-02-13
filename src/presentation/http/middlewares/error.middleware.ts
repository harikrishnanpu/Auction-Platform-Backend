import { Request, Response, NextFunction } from 'express';
import { AppError } from "../../../shared/app.error";
import { STATUS_CODE } from "../../../constants/status.code";
import { logger } from "../../../infrastructure/logger/pino.logger";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(err.message);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.statusCode,
            message: err.message,
        });
    }

    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        code: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
    });
};
