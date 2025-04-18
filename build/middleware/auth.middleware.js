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
exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
/**
 * Middleware to validate JWT access tokens from headers or cookies.
 * Populates req.user with userId and role if token is valid.
 */
const validateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let token;
    // Check for token in Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // Fallback to token from cookies (if applicable)
    if (!token && ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token)) {
        token = req.cookies.token;
    }
    if (!token) {
        logger_1.logger.warn('Unauthorized: No token provided');
        res.status(401).json({
            success: false,
            message: 'Unauthorized: No token found',
        });
        return;
    }
    try {
        // Decode and verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach user info to request object
        req.user = {
            userId: decoded.id,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        logger_1.logger.error(`Unauthorized: Invalid token - ${error.message}`);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
});
exports.validateToken = validateToken;
