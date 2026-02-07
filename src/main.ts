import { logger } from './infrastructure/logger/pino.logger';
import app from './server';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { SocketServer } from './infrastructure/sockets/socket-server';
import { initSocketHandlers } from './Di/socket.di';
dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        const httpServer = createServer(app);

        // Initialize Socket Server
        const io = SocketServer.init(httpServer, {});

        // Initialize Socket Handlers
        initSocketHandlers(io);

        httpServer.listen(PORT, () => {
            logger.info(`Server started on ${PORT}`);
        });
    } catch (err) {
        logger.error('Server error:' + err);
    }
};

startServer();
