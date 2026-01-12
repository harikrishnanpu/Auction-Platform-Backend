import { logger } from './infrastructure/logger/pino.logger';
import app from './server';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            logger.info(`Server started on ${PORT}`);
        });
    } catch (err) {
        logger.error('Server error:' + err);
    }
};

startServer();
