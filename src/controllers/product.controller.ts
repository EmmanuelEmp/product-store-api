// src/controllers/product.controller.ts

import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import mongoose from 'mongoose';

export class ProductController {
  // Create a new product
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(403).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const createdBy = req.user.userId;

      const product = await productService.createProduct({
        ...req.body,
        createdBy,
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // Get all products with pagination
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;  // set default to page 1
      const limit = parseInt(req.query.limit as string) || 10;  // set default to 10 items per page

      const { products, total } = await productService.getPaginatedProducts(page, limit);

      res.status(200).json({
        success: true,
        count: products.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a single product by ID
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid product ID' });
        return;
      }

      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // Update a product
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      if (!userId) {
        throw new Error('User ID is required');
      }

      const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body,
        userId,
        userRole
      );

      if (!updatedProduct) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }

      if (
        error.name === 'ValidationError' ||
        error.message.includes('Cast to')
      ) {
        res.status(400).json({ success: false, message: 'Invalid data provided' });
        return;
      }

      next(error);
    }
  }

  // Delete a product
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      if (!userId) {
        throw new Error('User ID is required');
      }

      const deleted = await productService.deleteProduct(
        req.params.id,
        userId,
        userRole
      );

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, message: error.message });
        return
      }

      next(error);
    }
  }
}
