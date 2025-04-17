import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import validate from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Register a new user
router.post('/register', validate(registerSchema), authController.register);

// Login user and return tokens
router.post('/login', validate(loginSchema), authController.login);

// Get authenticated user's profile
router.get('/profile', validateToken, authController.getProfile);

// Logout by deleting refresh token
router.post('/logout', authController.logout);

// Refresh tokens using a valid refresh token
router.post('/refresh-token', authController.refreshToken);

export default router;
