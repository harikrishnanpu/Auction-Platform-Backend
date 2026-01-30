"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_logger_1 = require("./infrastructure/logger/pino.logger");
const server_1 = __importDefault(require("./server"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const auction_socket_1 = require("./presentation/sockets/auction.socket");
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
const startServer = async () => {
    try {
        const httpServer = (0, http_1.createServer)(server_1.default);
        (0, auction_socket_1.initAuctionSocket)(httpServer);
        httpServer.listen(PORT, () => {
            pino_logger_1.logger.info(`Server started on ${PORT}`);
        });
    }
    catch (err) {
        pino_logger_1.logger.error('Server error:' + err);
    }
};
startServer();
