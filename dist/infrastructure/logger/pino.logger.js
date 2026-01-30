"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinoLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
exports.logger = (0, pino_1.default)({
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
class PinoLogger {
    constructor(logger) {
        this._logger = logger;
    }
    info(message, meta) {
        this._logger.info(meta ?? {}, message);
    }
    warn(message, meta) {
        this._logger.warn(meta ?? {}, message);
    }
    error(message, meta) {
        this._logger.error(meta ?? {}, message);
    }
    debug(message, meta) {
        this._logger.debug(meta ?? {}, message);
    }
}
exports.PinoLogger = PinoLogger;
