import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { generateToken } from '../utils/generateToken';
import { logger } from '../utils/logger';
import { IUser } from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Register controller called with body:', req.body); // Debug log
      if (!req.body.name || !req.body.email || !req.body.password) {
        const error = new Error('Name, email, and password are required');
        (error as any).status = 400;
        throw error;
      }

      const user = await authService.register(req.body) as IUser;
      console.log('Register: User created:', user); // Debug log
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
        data: { user: { id: user._id, email: user.email }, accessToken, refreshToken },
      });
    } catch (error) {
      console.log('Register controller error:', error); // Debug log
      logger.error(`Register controller error: ${(error as Error).message}`);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Login controller called with body:', req.body); // Debug log
      if (!req.body.email || !req.body.password) {
        const error = new Error('Email and password are required');
        (error as any).status = 400;
        throw error;
      }

      const tokens = await authService.login(req.body.email, req.body.password);
      console.log('Login: Tokens received:', tokens); // Debug log
      if (!tokens) {
        const error = new Error('Login failed');
        (error as any).status = 500;
        throw error;
      }

      res.status(200).json({
        message: 'Login successful',
        data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      });
    } catch (error) {
      console.log('Login controller error:', error); // Debug log
      logger.error(`Login controller error: ${(error as Error).message}`);
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('GetProfile controller called with user:', req.user); // Debug log
      if (!req.user) {
        const error = new Error('User information is missing');
        (error as any).status = 400;
        throw error;
      }
      const user = await authService.getUserById(req.user.userId);
      console.log('GetProfile: User retrieved:', user); // Debug log
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
      console.log('GetProfile controller error:', error); // Debug log
      logger.error(`Get profile error: ${(error as Error).message}`);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Logout controller called with body:', req.body); // Debug log
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
      console.log('Logout controller error:', error); // Debug log
      logger.error(`Logout controller error: ${(error as Error).message}`);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('RefreshToken controller called with body:', req.body); // Debug log
      const { refreshToken } = req.body;
      if (!refreshToken) {
        logger.error('Refresh token required');
        const error = new Error('Refresh token required');
        (error as any).status = 400;
        throw error;
      }

      const tokens = await authService.refreshToken(refreshToken);
      console.log('RefreshToken: Tokens received:', tokens); // Debug log
      if (!tokens) {
        logger.error('Invalid refresh token');
        const error = new Error('Invalid refresh token');
        (error as any).status = 401;
        throw error;
      }
      logger.info('Token refreshed successfully');
      res.status(200).json({ message: 'Token refreshed', data: tokens });
    } catch (error) {
      console.log('RefreshToken controller error:', error); // Debug log
      logger.error(`Refresh token error: ${(error as Error).message}`);
      next(error);
    }
  }
}