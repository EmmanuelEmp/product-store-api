
import { Express, Response, Request, NextFunction} from "express"
import { logger } from "../utils/logger";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  logger.error(error.status, error.message); // Log the error details
  console.error(`ErrorHandler: ${message} (Status: ${status})`); // Debug log
  res.status(status).json({ message });
};

