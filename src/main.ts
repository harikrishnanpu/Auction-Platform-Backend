import { logger } from './infrastructure/logger/pino.logger';
import app from './server';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initAuctionSocket } from './presentation/sockets/auction.socket';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        const httpServer = createServer(app);
        initAuctionSocket(httpServer);

        httpServer.listen(PORT, () => {
            logger.info(`Server started on ${PORT}`);
        });
    } catch (err) {
        logger.error('Server error:' + err);
    }
};

startServer();
