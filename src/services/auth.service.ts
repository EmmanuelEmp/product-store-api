import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken';
import { IUser, User } from '../models/user.model';
import { logger } from '../utils/logger';
import RefreshToken from '../models/refreshToken.model';

export class AuthService {
  /**
   * Registers a new user if email isn't already taken.
   */
  async register(userData: Partial<IUser>): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        logger.warn(`Registration failed: Email already in use - ${userData.email}`);
        const error = new Error('Email already in use');
        (error as any).status = 409;
        throw error;
      }

      const user = new User(userData);
      await user.save();

      logger.info(`User registered: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Register error: ${(error as Error).message}`);
      if (!(error as any).status) (error as any).status = 500;
      throw error;
    }
  }

  /**
   * Authenticates user and returns access + refresh tokens.
   */
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await User.findOne({ email }) as IUser;
      if (!user) {
        logger.warn(`Login failed: User not found - ${email}`);
        const error = new Error('Invalid credentials');
        (error as any).status = 401;
        throw error;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        logger.warn(`Login failed: Invalid password - ${email}`);
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
      logger.error(`Login error: ${(error as Error).message}`);
      if (!(error as any).status) (error as any).status = 500;
      throw error;
    }
  }

  /**
   * Retrieves user by ID without password field.
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return null;
      }
      return user;
    } catch (error) {
      logger.error(`Get user error: ${(error as Error).message}`);
      if (!(error as any).status) (error as any).status = 500;
      throw error;
    }
  }

  /**
   * Removes a refresh token from DB (logout).
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await RefreshToken.findOneAndDelete({ token: refreshToken });
      logger.info(`Refresh token deleted`);
    } catch (error) {
      logger.error(`Logout error: ${(error as Error).message}`);
      if (!(error as any).status) (error as any).status = 500;
      throw error;
    }
  }

  /**
   * Issues new access and refresh tokens if valid and not expired.
   */
  async refreshToken(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
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
        logger.warn('User not found for refresh token');
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

      logger.info(`Issued new tokens for user: ${user.email}`);
      return tokens;
    } catch (error) {
      logger.error(`Refresh token error: ${(error as Error).message}`);
      if (!(error as any).status) (error as any).status = 500;
      throw error;
    }
  }
}
