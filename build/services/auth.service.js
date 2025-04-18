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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateToken_1 = require("../utils/generateToken");
const user_model_1 = require("../models/user.model");
const logger_1 = require("../utils/logger");
const refreshToken_model_1 = __importDefault(require("../models/refreshToken.model"));
class AuthService {
    /**
     * Registers a new user if email isn't already taken.
     */
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield user_model_1.User.findOne({ email: userData.email });
                if (existingUser) {
                    logger_1.logger.warn(`Registration failed: Email already in use - ${userData.email}`);
                    const error = new Error('Email already in use');
                    error.status = 409;
                    throw error;
                }
                const user = new user_model_1.User(userData);
                yield user.save();
                logger_1.logger.info(`User registered: ${user.email}`);
                return user;
            }
            catch (error) {
                logger_1.logger.error(`Register error: ${error.message}`);
                if (!error.status)
                    error.status = 500;
                throw error;
            }
        });
    }
    /**
     * Authenticates user and returns access + refresh tokens.
     */
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.User.findOne({ email });
                if (!user) {
                    logger_1.logger.warn(`Login failed: User not found - ${email}`);
                    const error = new Error('Invalid credentials');
                    error.status = 401;
                    throw error;
                }
                const valid = yield bcrypt_1.default.compare(password, user.password);
                if (!valid) {
                    logger_1.logger.warn(`Login failed: Invalid password - ${email}`);
                    const error = new Error('Invalid credentials');
                    error.status = 401;
                    throw error;
                }
                const { accessToken, refreshToken } = yield (0, generateToken_1.generateToken)({
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                });
                logger_1.logger.info(`User logged in: ${email}`);
                return { accessToken, refreshToken };
            }
            catch (error) {
                logger_1.logger.error(`Login error: ${error.message}`);
                if (!error.status)
                    error.status = 500;
                throw error;
            }
        });
    }
    /**
     * Retrieves user by ID without password field.
     */
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.User.findById(userId).select('-password');
                if (!user) {
                    logger_1.logger.warn(`User not found: ${userId}`);
                    return null;
                }
                return user;
            }
            catch (error) {
                logger_1.logger.error(`Get user error: ${error.message}`);
                if (!error.status)
                    error.status = 500;
                throw error;
            }
        });
    }
    /**
     * Removes a refresh token from DB (logout).
     */
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield refreshToken_model_1.default.findOneAndDelete({ token: refreshToken });
                logger_1.logger.info(`Refresh token deleted`);
            }
            catch (error) {
                logger_1.logger.error(`Logout error: ${error.message}`);
                if (!error.status)
                    error.status = 500;
                throw error;
            }
        });
    }
    /**
     * Issues new access and refresh tokens if valid and not expired.
     */
    refreshToken(oldRefreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const storedToken = yield refreshToken_model_1.default.findOne({ token: oldRefreshToken });
                if (!storedToken) {
                    logger_1.logger.warn('Invalid refresh token');
                    const error = new Error('Invalid refresh token');
                    error.status = 401;
                    throw error;
                }
                if (storedToken.expiresAt < new Date()) {
                    yield refreshToken_model_1.default.findOneAndDelete({ token: oldRefreshToken });
                    logger_1.logger.warn('Expired refresh token');
                    const error = new Error('Refresh token expired');
                    error.status = 401;
                    throw error;
                }
                const user = yield user_model_1.User.findById(storedToken.user);
                if (!user) {
                    logger_1.logger.warn('User not found for refresh token');
                    const error = new Error('User not found');
                    error.status = 401;
                    throw error;
                }
                yield refreshToken_model_1.default.findOneAndDelete({ token: oldRefreshToken });
                const tokens = yield (0, generateToken_1.generateToken)({
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                });
                logger_1.logger.info(`Issued new tokens for user: ${user.email}`);
                return tokens;
            }
            catch (error) {
                logger_1.logger.error(`Refresh token error: ${error.message}`);
                if (!error.status)
                    error.status = 500;
                throw error;
            }
        });
    }
}
exports.AuthService = AuthService;
