import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { generateToken } from '../utils/generateToken';
import { logger } from '../utils/logger';
import { IUser } from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';

const authService = new AuthService();

export class AuthController {
  // Handles user registration
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        const error = new Error('Name, email, and password are required');
        (error as any).status = 400;
        throw error;
      }

      const user = await authService.register({ name, email, password }) as IUser;

      if (!user || !user._id) {
        const error = new Error('Failed to create user');
        (error as any).status = 500;
        throw error;
      }

      const { accessToken, refreshToken } = await generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        message: 'Registration successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error(`Register controller error: ${(error as Error).message}`);
      next(error);
    }
  }

  // Handles user login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const error = new Error('Email and password are required');
        (error as any).status = 400;
        throw error;
      }

      const tokens = await authService.login(email, password);

      if (!tokens) {
        const error = new Error('Login failed');
        (error as any).status = 500;
        throw error;
      }

      res.status(200).json({
        message: 'Login successful',
        data: tokens,
      });
    } catch (error) {
      logger.error(`Login controller error: ${(error as Error).message}`);
      next(error);
    }
  }

  // Fetches the current user's profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        const error = new Error('User information is missing');
        (error as any).status = 400;
        throw error;
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        const error = new Error('User not found');
        (error as any).status = 404;
        throw error;
      }

      res.status(200).json({
        message: 'User profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      logger.error(`Get profile error: ${(error as Error).message}`);
      next(error);
    }
  }

  // Handles user logout by removing refresh token
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const error = new Error('Refresh token required');
        (error as any).status = 400;
        throw error;
      }

      const tokenExists = await RefreshToken.findOne({ token: refreshToken });

      if (!tokenExists) {
        const error = new Error('Invalid or expired token');
        (error as any).status = 400;
        throw error;
      }

      await RefreshToken.deleteOne({ token: refreshToken });

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      logger.error(`Logout controller error: ${(error as Error).message}`);
      next(error);
    }
  }

  // Refreshes JWT tokens using a valid refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const error = new Error('Refresh token required');
        (error as any).status = 400;
        throw error;
      }

      const tokens = await authService.refreshToken(refreshToken);

      if (!tokens) {
        const error = new Error('Invalid refresh token');
        (error as any).status = 401;
        throw error;
      }

      res.status(200).json({ message: 'Token refreshed', data: tokens });
    } catch (error) {
      logger.error(`Refresh token error: ${(error as Error).message}`);
      next(error);
    }
  }
}
