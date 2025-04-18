"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware to validate request body against a Joi schema.
 * Returns a 400 Bad Request if validation fails.
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            // Extract all validation error messages into a readable string
            const message = error.details.map((detail) => detail.message).join(', ');
            const validationError = new Error(message);
            validationError.status = 400;
            // Forward to the error handler middleware
            return next(validationError);
        }
        next();
    };
};
exports.default = validate;
