import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

/**
 * Middleware to validate JWT access tokens from headers or cookies.
 * Populates req.user with userId and role if token is valid.
 */
const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check for token in Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback to token from cookies (if applicable)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    logger.warn('Unauthorized: No token provided');
    res.status(401).json({
      success: false,
      message: 'Unauthorized: No token found',
    });
    return;
  }

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    // Attach user info to request object
    req.user = {
      userId: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error(`Unauthorized: Invalid token - ${(error as Error).message}`);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export { validateToken };
