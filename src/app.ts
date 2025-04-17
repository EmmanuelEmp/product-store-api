import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import productRoutes from './routes/product.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setMiddleware();
    this.setRoutes();
    this.setErrorHandling();
  }

  private setMiddleware() {
    // Rate Limiter
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    this.app.use(limiter); // Apply rate limiter to all requests

    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
  }

  private setRoutes() {
    this.app.get('/', (req, res) => {
      res.send('Welcome to the API!');
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/products', productRoutes);
  }

  private setErrorHandling() {
    this.app.use(errorHandler);
  }
}

export default new App().app;

