// src/services/product.service.ts

import { Product } from '../models/product.model';
import { IProduct } from '../models/product.model';
import mongoose from 'mongoose';

class ProductService {
  async createProduct(data: Partial<IProduct>) {
    return await Product.create(data);
  }

  async getAllProducts() {
    return await Product.find().populate('createdBy', 'name email');
  }

  async getProductById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Product.findById(id).populate('createdBy', 'name email');
  }

  async updateProduct(id: string, data: Partial<IProduct>, userId: string, userRole: string) {
    const product = await Product.findById(id);
    if (!product) return null;

    if (product.createdBy.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteProduct(id: string, userId: string, userRole: string) {
    const product = await Product.findById(id);
    if (!product) return null;

    if (product.createdBy.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    await product.deleteOne();
    return true;
  }
}

export default new ProductService();
