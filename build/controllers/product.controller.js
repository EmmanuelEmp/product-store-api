"use strict";
// src/controllers/product.controller.ts
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
exports.ProductController = void 0;
const product_service_1 = __importDefault(require("../services/product.service"));
const mongoose_1 = __importDefault(require("mongoose"));
class ProductController {
    // Create a new product
    createProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(403).json({ success: false, message: 'Unauthorized' });
                    return;
                }
                const createdBy = req.user.userId;
                const product = yield product_service_1.default.createProduct(Object.assign(Object.assign({}, req.body), { createdBy }));
                res.status(201).json({ success: true, data: product });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get all products
    getAllProducts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield product_service_1.default.getAllProducts();
                res.status(200).json({
                    success: true,
                    count: products.length,
                    data: products,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get a single product by ID
    getProductById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ success: false, message: 'Invalid product ID' });
                    return;
                }
                const product = yield product_service_1.default.getProductById(id);
                if (!product) {
                    res.status(404).json({ success: false, message: 'Product not found' });
                    return;
                }
                res.status(200).json({ success: true, data: product });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Update a product
    updateProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'user';
                if (!userId) {
                    throw new Error('User ID is required');
                }
                const updatedProduct = yield product_service_1.default.updateProduct(req.params.id, req.body, userId, userRole);
                if (!updatedProduct) {
                    res.status(404).json({ success: false, message: 'Product not found' });
                    return;
                }
                res.status(200).json({ success: true, data: updatedProduct });
            }
            catch (error) {
                if (error.message === 'Unauthorized') {
                    res.status(403).json({ success: false, message: error.message });
                    return;
                }
                if (error.name === 'ValidationError' ||
                    error.message.includes('Cast to')) {
                    res.status(400).json({ success: false, message: 'Invalid data provided' });
                    return;
                }
                next(error);
            }
        });
    }
    // Delete a product
    deleteProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'user';
                if (!userId) {
                    throw new Error('User ID is required');
                }
                const deleted = yield product_service_1.default.deleteProduct(req.params.id, userId, userRole);
                if (!deleted) {
                    res.status(404).json({ success: false, message: 'Product not found' });
                    return;
                }
                res.status(200).json({ success: true, message: 'Product deleted successfully' });
            }
            catch (error) {
                if (error.message === 'Unauthorized') {
                    res.status(403).json({ success: false, message: error.message });
                    return;
                }
                next(error);
            }
        });
    }
}
exports.ProductController = ProductController;
