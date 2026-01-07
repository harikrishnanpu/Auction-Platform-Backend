import mongoose from 'mongoose';
import app from './server';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auction-platform';

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

startServer();
