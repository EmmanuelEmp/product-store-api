"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
/**
 * Global error handler middleware.
 * Catches and responds with standardized error format.
 */
const errorHandler = (error, req, res, next) => {
    const statusCode = error.status || 500;
    const message = error.message || 'Internal Server Error';
    // Log error using custom logger
    logger_1.logger.error(`Error ${statusCode} - ${message}`);
    // Log stack trace in development for deeper debugging
    if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
    }
    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
exports.errorHandler = errorHandler;
