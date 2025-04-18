"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = __importDefault(require("../middleware/validate"));
const auth_validation_1 = require("../validation/auth.validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Register a new user
router.post('/register', (0, validate_1.default)(auth_validation_1.registerSchema), authController.register);
// Login user and return tokens
router.post('/login', (0, validate_1.default)(auth_validation_1.loginSchema), authController.login);
// Get authenticated user's profile
router.get('/profile', auth_middleware_1.validateToken, authController.getProfile);
// Logout by deleting refresh token
router.post('/logout', authController.logout);
// Refresh tokens using a valid refresh token
router.post('/refresh-token', authController.refreshToken);
exports.default = router;
