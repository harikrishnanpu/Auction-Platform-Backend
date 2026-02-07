"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const socket_io_1 = require("socket.io");
const pino_logger_1 = require("../logger/pino.logger");
class SocketServer {
    static init(httpServer, options) {
        if (!this.io) {
            this.io = new socket_io_1.Server(httpServer, {
                cors: {
                    origin: [
                        process.env.FRONTEND_URL || "http://localhost:3000",
                        process.env.CLIENT_URL || "http://localhost:3000",
                        "http://192.168.1.10:3000",
                        "https://0626e2f0a09a.ngrok-free.app"
                    ],
                    credentials: true,
                    methods: ["GET", "POST"]
                },
                transports: ["polling", "websocket"],
                pingTimeout: 60000,
                pingInterval: 25000,
                ...options
            });
            pino_logger_1.logger.info("Socket.io initialized successfully");
        }
        return this.io;
    }
    static getInstance() {
        if (!this.io) {
            throw new Error("SocketServer must be initialized before use");
        }
        return this.io;
    }
}
exports.SocketServer = SocketServer;
