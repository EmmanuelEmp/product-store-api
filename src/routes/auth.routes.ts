import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import validate from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// 👇 This validates the request body BEFORE calling controller
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', validateToken, authController.getProfile); 
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

export default router;
