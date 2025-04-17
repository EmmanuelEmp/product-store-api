// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import mongoose from 'mongoose';

export class ProductController {
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

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ success: false, message: 'Invalid product ID' });
        return;
      }

      const product = await productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body,
        req.user?.userId || (() => { throw new Error('User ID is required'); })(),
        req.user?.role
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
      if (error.name === 'ValidationError' || error.message.includes('Cast to')) {
        res.status(400).json({ success: false, message: 'Invalid data provided' });
        return;
      }
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await productService.deleteProduct(
        req.params.id,
        req.user?.userId || (() => { throw new Error('User ID is required'); })(),
        req.user?.role
      );

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}
