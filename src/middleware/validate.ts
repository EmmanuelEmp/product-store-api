

import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      const validationError = new Error(message);
      (validationError as any).status = 400;
      return next(validationError);
    }
    next();
  };
};

export default validate;