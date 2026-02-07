import { Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { logger } from "../logger/pino.logger";

export class SocketServer {
    private static io: Server;

    public static init(httpServer: HttpServer, options: Partial<ServerOptions>): Server {
        if (!this.io) {
            this.io = new Server(httpServer, {
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
            logger.info("Socket.io initialized successfully");
        }
        return this.io;
    }

    public static getInstance(): Server {
        if (!this.io) {
            throw new Error("SocketServer must be initialized before use");
        }
        return this.io;
    }
}
