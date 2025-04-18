"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const validate_1 = __importDefault(require("../middleware/validate"));
const product_validation_1 = require("../validation/product.validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// Public Routes
// Get all products
router.get('/', productController.getAllProducts);
// Get product by ID
router.get('/:id', productController.getProductById);
// Protected Routes
// Create a new product (auth required)
router.post('/', auth_middleware_1.validateToken, (0, validate_1.default)(product_validation_1.productSchema), productController.createProduct);
// Update a product (auth required)
router.put('/:id', auth_middleware_1.validateToken, (0, validate_1.default)(product_validation_1.productSchema), productController.updateProduct);
// Delete a product (auth required)
router.delete('/:id', auth_middleware_1.validateToken, productController.deleteProduct);
exports.default = router;
