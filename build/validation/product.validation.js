"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
// Product validation schema using Joi
const joi_1 = __importDefault(require("joi"));
exports.productSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        'string.empty': 'Product name is required',
    }),
    description: joi_1.default.string().allow(''),
    price: joi_1.default.number().positive().required().messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required',
    }),
    quantity: joi_1.default.number().integer().min(0).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity cannot be negative',
        'any.required': 'Quantity is required',
    }),
    category: joi_1.default.string().allow(''),
});
