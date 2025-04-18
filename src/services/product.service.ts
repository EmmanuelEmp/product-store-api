import { Product } from '../models/product.model';
import { IProduct } from '../models/product.model';
import mongoose from 'mongoose';

class ProductService {
  /**
   * Creates a new product.
   * @param {Partial<IProduct>} data - The product data.
   * @returns {Promise<IProduct>} - The created product.
   */
  async createProduct(data: Partial<IProduct>) {
    return await Product.create(data);
  }

  /**
   * Retrieves paginated products, populated with the creator's info.
   * @param {number} page - The page number.
   * @param {number} limit - The number of products per page.
   * @returns {Promise<{ products: IProduct[], total: number }>} - A paginated list of products.
   */
  async getPaginatedProducts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    // Get paginated products and total count
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');
      
    const total = await Product.countDocuments();
    
    return { products, total };
  }

  /**
   * Retrieves all products, populated with the creator's info.
   * @returns {Promise<IProduct[]>} - List of all products.
   */
  async getAllProducts() {
    return await Product.find().populate('createdBy', 'name email');
  }

  /**
   * Retrieves a product by ID.
   * @param {string} id - Product ID.
   * @returns {Promise<IProduct | null>} - The product, or null if not found.
   */
  async getProductById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Product.findById(id).populate('createdBy', 'name email');
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
  async updateProduct(id: string, data: Partial<IProduct>, userId: string, userRole: string) {
    const product = await Product.findById(id);
    if (!product) return null;

    if (product.createdBy.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Deletes a product.
   * @param {string} id - Product ID.
   * @param {string} userId - User ID of the requester.
   * @param {string} userRole - User role (e.g., admin).
   * @returns {Promise<boolean>} - True if deleted, false if not found.
   * @throws {Error} - Throws if the user is unauthorized.
   */
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
