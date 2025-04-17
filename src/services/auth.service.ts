import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken';
import { IUser, User } from '../models/user.model';
import { logger } from '../utils/logger';
import RefreshToken from '../models/refreshToken.model';

export class AuthService {
  async register(userData: Partial<IUser>): Promise<IUser> {
    try {
      console.log('authService.register called with:', userData); // Debug log
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        logger.warn(`Registration failed. Email already in use: ${userData.email}`);
        const error = new Error('Email already in use');
        (error as any).status = 409;
        throw error;
      }

      const user = new User({ ...userData });
      await user.save();

      logger.info(`User registered: ${user.email}`);
      return user;
    } catch (error) {
      console.log('authService.register error:', error); // Debug log
      logger.error(`Register error: ${(error as Error).message}`);
      if (!(error as any).status) {
        (error as any).status = 500;
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      console.log('authService.login called with:', email, password); // Debug log
      const user = await User.findOne({ email }) as IUser;
      if (!user) {
        logger.warn(`Login failed. User not found: ${email}`);
        const error = new Error('Invalid credentials');
        (error as any).status = 401;
        throw error;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        logger.warn(`Login failed. Invalid password for: ${email}`);
        const error = new Error('Invalid credentials');
        (error as any).status = 401;
        throw error;
      }

      const { accessToken, refreshToken } = await generateToken({
        _id: (user._id as string).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });

      logger.info(`User logged in: ${email}`);
      return { accessToken, refreshToken };
    } catch (error) {
      console.log('authService.login error:', error); // Debug log
      logger.error(`Login error: ${(error as Error).message}`);
      if (!(error as any).status) {
        (error as any).status = 500;
      }
      throw error;
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      console.log('authService.getUserById called with:', userId); // Debug log
      const user = await User.findById(userId).select('-password');
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return null;
      }
      return user;
    } catch (error) {
      console.log('authService.getUserById error:', error); // Debug log
      logger.error(`Get user error: ${(error as Error).message}`);
      if (!(error as any).status) {
        (error as any).status = 500;
      }
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      console.log('authService.logout called with:', refreshToken); // Debug log
      await RefreshToken.findOneAndDelete({ token: refreshToken });
    } catch (error) {
      console.log('authService.logout error:', error); // Debug log
      logger.error(`Logout error: ${(error as Error).message}`);
      if (!(error as any).status) {
        (error as any).status = 500;
      }
      throw error;
    }
  }

  async refreshToken(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      console.log('authService.refreshToken called with:', oldRefreshToken); // Debug log
      const storedToken = await RefreshToken.findOne({ token: oldRefreshToken });
      if (!storedToken) {
        logger.warn('Invalid refresh token');
        const error = new Error('Invalid refresh token');
        (error as any).status = 401;
        throw error;
      }

      if (storedToken.expiresAt < new Date()) {
        await RefreshToken.findOneAndDelete({ token: oldRefreshToken });
        logger.warn('Expired refresh token');
        const error = new Error('Refresh token expired');
        (error as any).status = 401;
        throw error;
      }

      const user = await User.findById(storedToken.user);
      if (!user) {
        logger.warn('User not found');
        const error = new Error('User not found');
        (error as any).status = 401;
        throw error;
      }

      await RefreshToken.findOneAndDelete({ token: oldRefreshToken });

      const tokens = await generateToken({
        _id: (user._id as string).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      console.log('authService.refreshToken error:', error); // Debug log
      logger.error(`Refresh token error: ${(error as Error).message}`);
      if (!(error as any).status) {
        (error as any).status = 500;
      }
      throw error;
    }
  }
}