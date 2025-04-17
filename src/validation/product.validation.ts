// src/validation/product.validation.ts
import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Product name is required',
  }),
  description: Joi.string().allow(''),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required',
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity cannot be negative',
    'any.required': 'Quantity is required',
  }),
  category: Joi.string().allow(''),
});
