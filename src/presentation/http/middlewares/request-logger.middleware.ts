import { ILogger } from "@application/ports/logger.port";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestLoggerMiddleware =
  (logger: ILogger) =>
    (req: Request, res: Response, next: NextFunction) => {
      const requestId = uuidv4();
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
