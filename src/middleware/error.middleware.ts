import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware.
 * Catches and responds with standardized error format.
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Log error using custom logger
  logger.error(`Error ${statusCode} - ${message}`);
  
  // Log stack trace in development for deeper debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
