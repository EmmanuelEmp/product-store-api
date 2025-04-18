import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setMiddleware();
    this.setRoutes();
    this.setErrorHandling();
  }

  private setMiddleware() {
    // Global rate limiter
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use(limiter);
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setRoutes() {
    this.app.get('/', (req, res) => {
      res.json({ message: 'Welcome to the API!' });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/products', productRoutes);
  }

  private setErrorHandling() {
    // Handle unknown routes
    this.app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Central error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
