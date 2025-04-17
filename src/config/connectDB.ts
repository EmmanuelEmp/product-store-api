import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      logger.error('MongoDB URI is missing. Please check your .env file.');
      process.exit(1); // Exit the process with failure
    }

    // Log the connection attempt
    logger.info(`MONGO URI: ${mongoUri}`);

    // Connect to MongoDB with options
    const conn = await mongoose.connect(mongoUri);

    // Log successful connection
    logger.info('DB Connected');
    
  } catch (error) {
    // Log error details
    logger.error('Error connecting to DB: ', error);
    process.exit(1); // Exit the process with failure
  }
};
