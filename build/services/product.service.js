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
const product_model_1 = require("../models/product.model");
const mongoose_1 = __importDefault(require("mongoose"));
class ProductService {
    /**
     * Creates a new product.
     * @param {Partial<IProduct>} data - The product data.
     * @returns {Promise<IProduct>} - The created product.
     */
    createProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield product_model_1.Product.create(data);
        });
    }
    /**
     * Retrieves all products, populated with the creator's info.
     * @returns {Promise<IProduct[]>} - List of all products.
     */
    getAllProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield product_model_1.Product.find().populate('createdBy', 'name email');
        });
    }
    /**
     * Retrieves a product by ID.
     * @param {string} id - Product ID.
     * @returns {Promise<IProduct | null>} - The product, or null if not found.
     */
    getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id))
                return null;
            return yield product_model_1.Product.findById(id).populate('createdBy', 'name email');
        });
    }
    /**
     * Updates a product.
     * @param {string} id - Product ID.
     * @param {Partial<IProduct>} data - The update data.
     * @param {string} userId - User ID of the requester.
     * @param {string} userRole - User role (e.g., admin).
     * @returns {Promise<IProduct | null>} - The updated product, or null if not found.
     * @throws {Error} - Throws if the user is unauthorized.
     */
    updateProduct(id, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_model_1.Product.findById(id);
            if (!product)
                return null;
            if (product.createdBy.toString() !== userId && userRole !== 'admin') {
                throw new Error('Unauthorized');
            }
            return yield product_model_1.Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        });
    }
    /**
     * Deletes a product.
     * @param {string} id - Product ID.
     * @param {string} userId - User ID of the requester.
     * @param {string} userRole - User role (e.g., admin).
     * @returns {Promise<boolean>} - True if deleted, false if not found.
     * @throws {Error} - Throws if the user is unauthorized.
     */
    deleteProduct(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_model_1.Product.findById(id);
            if (!product)
                return null;
            if (product.createdBy.toString() !== userId && userRole !== 'admin') {
                throw new Error('Unauthorized');
            }
            yield product.deleteOne();
            return true;
        });
    }
}
exports.default = new ProductService();
