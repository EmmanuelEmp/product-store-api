"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const generateToken_1 = require("../utils/generateToken");
const logger_1 = require("../utils/logger");
const refreshToken_model_1 = __importDefault(require("../models/refreshToken.model"));
const authService = new auth_service_1.AuthService();
class AuthController {
    // Handles user registration
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password } = req.body;
                if (!name || !email || !password) {
                    const error = new Error('Name, email, and password are required');
                    error.status = 400;
                    throw error;
                }
                const user = yield authService.register({ name, email, password });
                if (!user || !user._id) {
                    const error = new Error('Failed to create user');
                    error.status = 500;
                    throw error;
                }
                const { accessToken, refreshToken } = yield (0, generateToken_1.generateToken)({
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
            }
            catch (error) {
                logger_1.logger.error(`Register controller error: ${error.message}`);
                next(error);
            }
        });
    }
    // Handles user login
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    const error = new Error('Email and password are required');
                    error.status = 400;
                    throw error;
                }
                const tokens = yield authService.login(email, password);
                if (!tokens) {
                    const error = new Error('Login failed');
                    error.status = 500;
                    throw error;
                }
                res.status(200).json({
                    message: 'Login successful',
                    data: tokens,
                });
            }
            catch (error) {
                logger_1.logger.error(`Login controller error: ${error.message}`);
                next(error);
            }
        });
    }
    // Fetches the current user's profile
    getProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    const error = new Error('User information is missing');
                    error.status = 400;
                    throw error;
                }
                const user = yield authService.getUserById(req.user.userId);
                if (!user) {
                    const error = new Error('User not found');
                    error.status = 404;
                    throw error;
                }
                res.status(200).json({
                    message: 'User profile retrieved successfully',
                    data: { user },
                });
            }
            catch (error) {
                logger_1.logger.error(`Get profile error: ${error.message}`);
                next(error);
            }
        });
    }
    // Handles user logout by removing refresh token
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    const error = new Error('Refresh token required');
                    error.status = 400;
                    throw error;
                }
                const tokenExists = yield refreshToken_model_1.default.findOne({ token: refreshToken });
                if (!tokenExists) {
                    const error = new Error('Invalid or expired token');
                    error.status = 400;
                    throw error;
                }
                yield refreshToken_model_1.default.deleteOne({ token: refreshToken });
                res.status(200).json({ message: 'Logout successful' });
            }
            catch (error) {
                logger_1.logger.error(`Logout controller error: ${error.message}`);
                next(error);
            }
        });
    }
    // Refreshes JWT tokens using a valid refresh token
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    const error = new Error('Refresh token required');
                    error.status = 400;
                    throw error;
                }
                const tokens = yield authService.refreshToken(refreshToken);
                if (!tokens) {
                    const error = new Error('Invalid refresh token');
                    error.status = 401;
                    throw error;
                }
                res.status(200).json({ message: 'Token refreshed', data: tokens });
            }
            catch (error) {
                logger_1.logger.error(`Refresh token error: ${error.message}`);
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
