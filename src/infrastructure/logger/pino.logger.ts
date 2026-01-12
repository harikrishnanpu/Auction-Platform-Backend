import pino from "pino";
import { ILogger } from "../../application/ports/logger.port";

export const logger = pino({
  transport: {
    targets: [
          {
        target: "pino-pretty",
        level: "debug",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss"
        }
      },
      {
        target: "pino-loki",
        options: {
          host: "http://127.0.0.1:3100",
          labels: { app: "auction-backend" }
        }
      }
    ]
  }
});

export class PinoLogger implements ILogger {
  private _logger: pino.Logger;

  constructor(logger: pino.Logger) {
    this._logger = logger;
  }

  info(message: string, meta?: object) {
    this._logger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: object) {
    this._logger.warn(meta ?? {}, message);
  }

  error(message: string, meta?: object) {
    this._logger.error(meta ?? {}, message);
  }

  debug(message: string, meta?: object) {
    this._logger.debug(meta ?? {}, message);
  }
}
