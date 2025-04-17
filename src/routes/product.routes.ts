import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import validate from '../middleware/validate';
import { productSchema } from '../validation/product.validation';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// Public Routes

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Protected Routes

// Create a new product (auth required)
router.post('/', validateToken, validate(productSchema), productController.createProduct);

// Update a product (auth required)
router.put('/:id', validateToken, validate(productSchema), productController.updateProduct);

// Delete a product (auth required)
router.delete('/:id', validateToken, productController.deleteProduct);

export default router;
