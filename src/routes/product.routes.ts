import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import validate from '../middleware/validate';
import { productSchema } from '../validation/product.validation';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Routes
router.post('/', validateToken, validate(productSchema), productController.createProduct);
router.put('/:id', validateToken, validate(productSchema), productController.updateProduct);
router.delete('/:id', validateToken, productController.deleteProduct);

export default router;
