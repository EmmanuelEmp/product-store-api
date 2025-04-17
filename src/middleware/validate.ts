import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

/**
 * Middleware to validate request body against a Joi schema.
 * Returns a 400 Bad Request if validation fails.
 */
const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Extract all validation error messages into a readable string
      const message = error.details.map((detail) => detail.message).join(', ');

      const validationError = new Error(message);
      (validationError as any).status = 400;

      // Forward to the error handler middleware
      return next(validationError);
    }

    next();
  };
};

export default validate;
