import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/connectDB';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Error starting server: ', error);
        process.exit(1);
    }
};

startServer();
