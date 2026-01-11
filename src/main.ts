import app from './server';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server started on ${PORT}`);
        });
    } catch (err) {
        console.log('Server error:', err);
    }
};

startServer();
